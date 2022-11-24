/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package io.fusion.fusionbackend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;
import io.fusion.fusionbackend.dto.AssetTypeTemplateDto;
import io.fusion.fusionbackend.dto.AssetTypeTemplatePeerDto;
import io.fusion.fusionbackend.dto.FieldTargetDto;
import io.fusion.fusionbackend.dto.ProcessingResultDto;
import io.fusion.fusionbackend.dto.mappers.AssetTypeTemplateMapper;
import io.fusion.fusionbackend.dto.mappers.AssetTypeTemplatePeerMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.AssetTypeTemplatePeer;
import io.fusion.fusionbackend.model.BaseEntity;
import io.fusion.fusionbackend.model.enums.PublicationState;
import io.fusion.fusionbackend.repository.AssetTypeTemplatePeerRepository;
import io.fusion.fusionbackend.repository.AssetTypeTemplateRepository;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import io.fusion.fusionbackend.service.ontology.OntologyBuilder;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.ontology.OntModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class AssetTypeTemplateService {
    private final AssetTypeTemplateRepository assetTypeTemplateRepository;
    private final AssetTypeTemplatePeerService assetTypeTemplatePeerService;
    private final AssetTypeService assetTypeService;
    private final AssetTypeTemplateMapper assetTypeTemplateMapper;
    private final AssetTypeTemplatePeerMapper assetTypeTemplatePeerMapper;
    private final FieldTargetService fieldTargetService;
    private final OntologyBuilder ontologyBuilder;
    private final AssetTypeTemplatePeerRepository assetTypeTemplatePeerRepository;

    @Autowired
    public AssetTypeTemplateService(AssetTypeTemplateRepository assetTypeTemplateRepository,
                                    AssetTypeTemplatePeerService assetTypeTemplatePeerService,
                                    AssetTypeService assetTypeService,
                                    AssetTypeTemplateMapper assetTypeTemplateMapper,
                                    AssetTypeTemplatePeerMapper assetTypeTemplatePeerMapper,
                                    @Lazy FieldTargetService fieldTargetService,
                                    OntologyBuilder ontologyBuilder,
                                    AssetTypeTemplatePeerRepository assetTypeTemplatePeerRepository) {
        this.assetTypeTemplateRepository = assetTypeTemplateRepository;
        this.assetTypeTemplatePeerService = assetTypeTemplatePeerService;
        this.assetTypeService = assetTypeService;
        this.assetTypeTemplateMapper = assetTypeTemplateMapper;
        this.assetTypeTemplatePeerMapper = assetTypeTemplatePeerMapper;
        this.fieldTargetService = fieldTargetService;
        this.ontologyBuilder = ontologyBuilder;
        this.assetTypeTemplatePeerRepository = assetTypeTemplatePeerRepository;
    }

    public Set<AssetTypeTemplate> getAssetTypeTemplates() {
        return assetTypeTemplateRepository.findAll(AssetTypeTemplateRepository.DEFAULT_SORT);
    }

    public Set<AssetTypeTemplate> getPublishedAssetTypeTemplates() {
        return assetTypeTemplateRepository
                .findAll(AssetTypeTemplateRepository.DEFAULT_SORT)
                .stream().filter(assetTypeTemplate -> assetTypeTemplate.getPublishedDate() != null)
                .collect(Collectors.toSet());
    }

    public AssetTypeTemplate getAssetTypeTemplate(final Long assetTypeTemplateId, final boolean deep) {
        if (deep) {
            return assetTypeTemplateRepository.findDeepById(assetTypeTemplateId)
                    .orElseThrow(getAssetTypeTemplateNotFoundException(assetTypeTemplateId));
        }
        return assetTypeTemplateRepository.findById(assetTypeTemplateId)
                .orElseThrow(getAssetTypeTemplateNotFoundException(assetTypeTemplateId));
    }

    private Supplier<ResourceNotFoundException> getAssetTypeTemplateNotFoundException(Long assetTypeTemplateId) {
        log.debug("AssetTypeTemplate with ID {} not found", assetTypeTemplateId);
        return ResourceNotFoundException::new;
    }

    public AssetTypeTemplate createAssetTypeTemplateAggregate(final Long assetTypeId,
                                                              AssetTypeTemplate assetTypeTemplate) {

        Set<AssetTypeTemplatePeer> assetTypeTemplatePeers = assetTypeTemplate.getPeers();

        assetTypeTemplate = createAssetTypeTemplateWithoutPeers(assetTypeId, assetTypeTemplate);
        createPeersOfAssetTypeTemplate(assetTypeTemplate, assetTypeTemplatePeers);

        return assetTypeTemplate;
    }

    private AssetTypeTemplate createAssetTypeTemplateWithoutPeers(final Long assetTypeId,
                                                                  final AssetTypeTemplate assetTypeTemplate) {
        final AssetType assetType = assetTypeService.getAssetType(assetTypeId);

        validate(assetTypeTemplate, assetType);

        assetTypeTemplate.setAssetType(assetType);
        assetTypeTemplate.setPeers(new LinkedHashSet<>());

        return assetTypeTemplateRepository.save(assetTypeTemplate);
    }

    private void createPeersOfAssetTypeTemplate(AssetTypeTemplate assetTypeTemplate,
                                                Set<AssetTypeTemplatePeer> assetTypeTemplatePeers) {

        for (AssetTypeTemplatePeer assetTypeTemplatePeer : assetTypeTemplatePeers) {
            assetTypeTemplatePeerService.createAssetTypeTemplatePeer(assetTypeTemplate, assetTypeTemplatePeer);
        }
    }

    private void validate(final AssetTypeTemplate assetTypeTemplate, final AssetType assetType) {
        Objects.requireNonNull(assetTypeTemplate.getPublicationState(), "Publication state must be set but is null.");

        if (assetTypeTemplate.getPublicationState().equals(PublicationState.PUBLISHED)) {
            Objects.requireNonNull(assetTypeTemplate.getPublishedDate(),
                    "Published date must be set for publication state PUBLISHED");
        } else if (assetTypeTemplate.getPublicationState().equals(PublicationState.DRAFT)) {
            if (Objects.nonNull(assetTypeTemplate.getPublishedDate())) {
                throw new IllegalStateException("Published date not allowed for publication state DRAFT");
            }
        } else {
            throw new IllegalStateException("Unknown publication state: " + assetTypeTemplate.getPublicationState());
        }

        if (assetTypeTemplate.getId() == null && assetType != null && existsDraftToAssetType(assetType)) {
            String exception = "It is forbidden to create a new asset type template draft if another one exists.";
            throw new IllegalStateException(exception);
        }

        validateSubsystems(assetTypeTemplate, assetType);
        validatePeers(assetTypeTemplate);
    }

    private void validateSubsystems(final AssetTypeTemplate assetTypeTemplate, final AssetType assetType) {
        for (AssetTypeTemplate subsystem : assetTypeTemplate.getSubsystems()) {
            if (subsystem.getId().equals(assetTypeTemplate.getId())) {
                throw new IllegalStateException("An asset type template is not allowed to be a subsystem of itself.");
            }
            if (subsystem.getAssetType().getId().equals(assetType.getId())) {
                throw new
                        IllegalStateException("A subsystem has to be of another asset type than the parent template.");
            }
            if (assetTypeTemplateRepository.findAllPeerIds().contains(subsystem.getId())) {
                throw new RuntimeException("An asset type template can not be a subsystem if already used as peer.");
            }
            if (subsystem.getPublicationState().equals(PublicationState.DRAFT)) {
                throw new IllegalStateException("A subsystem has to be a published asset type template.");
            }
        }
    }

    private void validatePeers(final AssetTypeTemplate assetTypeTemplate) {
        List<Long> peerIds = assetTypeTemplate.getPeers().stream()
                .map(assetTypeTemplatePeer -> assetTypeTemplatePeer.getPeer().getId()).collect(Collectors.toList());

        if (peerIds.size() != new HashSet<>(peerIds).size()) {
            throw new RuntimeException("An asset type template must not have more than one peer to the same template.");
        }

        // Info: Single peers are validated in its service itself
    }

    private boolean existsDraftToAssetType(AssetType assetType) {
        final Iterable<AssetTypeTemplate> assetTypeTemplatesOfAssetType = this.assetTypeTemplateRepository
                .findAllByAssetType(assetType);

        for (AssetTypeTemplate assetTypeTemplate : assetTypeTemplatesOfAssetType) {
            if (assetTypeTemplate.getPublicationState().equals(PublicationState.DRAFT)) {
                return true;
            }
        }

        return false;
    }

    public AssetTypeTemplate updateAssetTypeTemplate(final Long assetTypeId,
                                                     final Long assetTypeTemplateId,
                                                     final AssetTypeTemplate sourceAssetTypeTemplate) {
        final AssetTypeTemplate targetAssetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        final AssetType assetType = assetTypeService.getAssetType(assetTypeId);

        validate(sourceAssetTypeTemplate, assetType);

        Set<AssetTypeTemplatePeer> savedPeersToBypassCopyingToTarget = sourceAssetTypeTemplate.getPeers();
        sourceAssetTypeTemplate.setPeers(new LinkedHashSet<>());
        targetAssetTypeTemplate.copyFrom(sourceAssetTypeTemplate);

        sourceAssetTypeTemplate.setPeers(savedPeersToBypassCopyingToTarget);
        assetTypeTemplatePeerService
                .updatePeersOfAssetTypeTemplate(targetAssetTypeTemplate, sourceAssetTypeTemplate);

        return targetAssetTypeTemplate;
    }

    public void deleteAssetTypeTemplate(final Long assetTypeTemplateId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);

        assetTypeTemplatePeerRepository.deleteAll(assetTypeTemplate.getPeers());
        assetTypeTemplateRepository.delete(assetTypeTemplate);
    }


    public Long getNextPublishVersion(final Long assetTypeId) {
        final List<AssetTypeTemplate> assetTypeTemplates = this.assetTypeTemplateRepository
                .findAllByAssetTypeId(assetTypeId);
        final Optional<Long> maxPublishedVersion = assetTypeTemplates.stream()
                .filter(assetTypeTemplate -> assetTypeTemplate.getPublicationState().equals(PublicationState.PUBLISHED)
                        && assetTypeId.equals(assetTypeTemplate.getAssetType().getId()))
                .map(AssetTypeTemplate::getPublishedVersion)
                .max(Long::compare);

        return maxPublishedVersion.isEmpty() ? 1 : maxPublishedVersion.get() + 1;
    }

    public AssetTypeTemplate setAssetType(final Long assetTypeTemplateId, final Long assetTypeId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId,
                false);
        final AssetType assetType = assetTypeService.getAssetType(assetTypeId);

        assetTypeTemplate.setAssetType(assetType);

        return assetTypeTemplate;
    }

    public Set<AssetTypeTemplate> findSubsystemCandidates(final Long parentAssetTypeId,
                                                          final Long assetTypeTemplateId) {
        return assetTypeTemplateRepository.findSubsystemCandidates(parentAssetTypeId, assetTypeTemplateId);
    }

    public OntModel getAssetTypeTemplateRdf(Long assetTypeTemplateId) {
        AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        return ontologyBuilder.buildAssetTypeTemplateOntology(assetTypeTemplate);
    }

    public void getAssetTypeTemplateExtendedJson(Long assetTypeTemplateId, PrintWriter writer) throws IOException {
        AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, true);
        assetTypeTemplate.setAssetSeries(null);
        assetTypeTemplate.getFieldTargets().forEach(fieldTarget -> {
            fieldTarget.setAssetTypeTemplate(null);
            fieldTarget.getField().getUnit().getQuantityType().setUnits(null);
            fieldTarget.getField().getUnit().getQuantityType().setBaseUnit(null);
        });
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(writer, assetTypeTemplate);
    }

    public byte[] exportAllToJson() throws IOException {
        Set<AssetTypeTemplate> publishedAssetTypeTemplates = getPublishedAssetTypeTemplates();

        Set<AssetTypeTemplateDto> publishedAssetTypeTemplatesDtos = assetTypeTemplateMapper
                .toDtoSet(publishedAssetTypeTemplates, true);
        sortFieldTargets(publishedAssetTypeTemplatesDtos);
        sortPeers(publishedAssetTypeTemplatesDtos);

        publishedAssetTypeTemplates = removeUnnecessaryItems(publishedAssetTypeTemplates);
        ObjectMapper objectMapper = BaseZipImportExport.getNewObjectMapper();
        return objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsBytes(BaseZipImportExport.toSortedList(publishedAssetTypeTemplatesDtos));
    }

    private Set<AssetTypeTemplateDto> removeUnnecessaryItems(Set<AssetTypeTemplateDto> assetTypeTemplateDtos) {
        Set<AssetTypeTemplateDto> resultAssetDtos = new LinkedHashSet<>();
        for (AssetTypeTemplateDto assetTypeTemplateDto : assetTypeTemplateDtos) {
            assetTypeTemplateDto.setPeerIds(null);
            assetTypeTemplateDto.getPeers().forEach(assetTypeTemplatePeerDto -> assetTypeTemplatePeerDto.setPeer(null));
            resultAssetDtos.add(assetTypeTemplateDto);
        }
        return resultAssetDtos;
    }

    private void sortFieldTargets(Set<AssetTypeTemplateDto> publishedAssetTypeTemplatesDtos) {
        for (AssetTypeTemplateDto publishedAssetTypeTemplatesDto : publishedAssetTypeTemplatesDtos) {
            sortFieldTargets(publishedAssetTypeTemplatesDto);
        }
    }

    private void sortFieldTargets(AssetTypeTemplateDto assetTypeTemplateDto) {
        assetTypeTemplateDto.setFieldTargetIds(null);
        Set<FieldTargetDto> sortedFieldTargetDtos = new LinkedHashSet<>(BaseZipImportExport
                .toSortedList(assetTypeTemplateDto.getFieldTargets()));
        assetTypeTemplateDto.setFieldTargets(sortedFieldTargetDtos);
    }

    private void sortPeers(Set<AssetTypeTemplateDto> publishedAssetTypeTemplatesDtos) {
        for (AssetTypeTemplateDto publishedAssetTypeTemplatesDto : publishedAssetTypeTemplatesDtos) {
            publishedAssetTypeTemplatesDto.setFieldTargetIds(null);
            Set<AssetTypeTemplatePeerDto> sortedAssetTypeTemplatePeerDtos = new LinkedHashSet<>(BaseZipImportExport
                    .toSortedList(publishedAssetTypeTemplatesDto.getPeers()));
            publishedAssetTypeTemplatesDto.setPeers(sortedAssetTypeTemplatePeerDtos);
        }
    }

    public ProcessingResultDto importMultipleFromJson(byte[] fileContent) throws IOException {
        final Set<AssetTypeTemplateDto> assetTypeTemplateDtos = BaseZipImportExport.fileContentToDtoSet(fileContent,
                new TypeReference<>() {
                });
        return importMultiple(assetTypeTemplateDtos);
    }

    public ProcessingResultDto importMultipleFromJsonFile(File file) throws IOException {
        final Set<AssetTypeTemplateDto> assetTypeTemplateDtos = BaseZipImportExport.fileToDtoSet(file,
                new TypeReference<>() {
                });
        return importMultiple(assetTypeTemplateDtos);
    }

    public ProcessingResultDto importSingleFromJsonFile(File file) throws IOException {
        final AssetTypeTemplateDto assetTypeTemplateDto = BaseZipImportExport.fileToDtoSet(file,
                new TypeReference<>() {
                });
        return importMultiple(Set.of(assetTypeTemplateDto));
    }

    public ProcessingResultDto importMultiple(Set<AssetTypeTemplateDto> assetTypeTemplateDtos) {
        final ProcessingResultDto result = new ProcessingResultDto();
        Set<Long> existingAssetTypeTemplateIds = assetTypeTemplateRepository
                .findAll(AssetTypeTemplateRepository.DEFAULT_SORT)
                .stream().map(BaseEntity::getId).collect(Collectors.toSet());

        Map<Long, Set<Long>> assetTypeTemplateSubsystemDtoMap = new HashMap<>();
        Map<Long, Set<AssetTypeTemplatePeerDto>> assetTypeTemplatePeerDtoMap = new HashMap<>();

        for (AssetTypeTemplateDto assetTypeTemplateDto : BaseZipImportExport.toSortedList(assetTypeTemplateDtos)) {
            if (!existingAssetTypeTemplateIds.contains(assetTypeTemplateDto.getId())) {
                removeAndCacheSubsystems(assetTypeTemplateSubsystemDtoMap, assetTypeTemplateDto);
                removeAndCachePeers(assetTypeTemplatePeerDtoMap, assetTypeTemplateDto);

                AssetTypeTemplate assetTypeTemplate = assetTypeTemplateMapper.toEntity(assetTypeTemplateDto);
                assetTypeTemplate.setFieldTargets(new LinkedHashSet<>());
                createAssetTypeTemplateAggregate(assetTypeTemplateDto.getAssetTypeId(), assetTypeTemplate);
                result.incHandled();
            } else {
                log.warn("Asset type template  with the id " + assetTypeTemplateDto.getId()
                        + " already exists. Entry is ignored.");
                result.incSkipped();
            }
        }

        fieldTargetService.createFieldTargetsFromAssetTypeTemplateDtos(assetTypeTemplateDtos);
        addCachedSubsystemsToAssetTypeTemplates(assetTypeTemplateSubsystemDtoMap);
        addCachedPeersToAssetTypeTemplates(assetTypeTemplatePeerDtoMap);

        return result;
    }

    public Boolean exportAssetTypeTemplateToJsonFile(AssetTypeTemplate assetTypeTemplate, final File file,
                                                     boolean overwrite) throws IOException {
        return exportAssetTypeTemplateToJsonFile(assetTypeTemplateMapper.toDto(assetTypeTemplate,
                true), file, overwrite);
    }

    private Boolean exportAssetTypeTemplateToJsonFile(AssetTypeTemplateDto assetTypeTemplateDto, final File file,
                                                      boolean overwrite)
            throws IOException {
        if (file.exists() && !overwrite) {
            return false;
        }
        sortFieldTargets(assetTypeTemplateDto);

        ObjectMapper objectMapper = BaseZipImportExport.getNewObjectMapper();
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, assetTypeTemplateDto);
        return true;
    }

    private void removeAndCacheSubsystems(final Map<Long, Set<Long>> assetTypeTemplateSubsystemDtoMap,
                                          final AssetTypeTemplateDto assetTypeTemplateDto) {
        assetTypeTemplateSubsystemDtoMap.put(assetTypeTemplateDto.getId(), assetTypeTemplateDto.getSubsystemIds());
        assetTypeTemplateDto.setSubsystemIds(null);
    }

    private void removeAndCachePeers(final Map<Long, Set<AssetTypeTemplatePeerDto>> assetTypeTemplatePeerDtoMap,
                                     final AssetTypeTemplateDto assetTypeTemplateDto) {
        assetTypeTemplatePeerDtoMap.put(assetTypeTemplateDto.getId(), assetTypeTemplateDto.getPeers());
        assetTypeTemplateDto.setPeers(new LinkedHashSet<>());
        assetTypeTemplateDto.setPeerIds(null);
    }

    private void addCachedSubsystemsToAssetTypeTemplates(final Map<Long, Set<Long>> assetTypeTemplateSubsystemDtoMap) {

        assetTypeTemplateSubsystemDtoMap.forEach((assetTypeTemplateId, subsystemIds) -> {
            AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
            Set<AssetTypeTemplate> subsystems = subsystemIds.stream()
                    .map(id -> getAssetTypeTemplate(id, false))
                    .collect(Collectors.toSet());

            assetTypeTemplate.setSubsystems(subsystems);
            updateAssetTypeTemplate(assetTypeTemplate.getAssetType().getId(),
                    assetTypeTemplate.getId(), assetTypeTemplate);
        });
    }

    private void addCachedPeersToAssetTypeTemplates(
            final Map<Long, Set<AssetTypeTemplatePeerDto>> assetTypeTemplatePeerDtoMap
    ) {

        assetTypeTemplatePeerDtoMap.forEach((assetTypeTemplateId, peerDtos) -> {
            AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);

            for (AssetTypeTemplatePeerDto peerDto : BaseZipImportExport.toSortedList(peerDtos)) {
                AssetTypeTemplatePeer assetTypeTemplatePeer = assetTypeTemplatePeerMapper.toEntity(peerDto);
                assetTypeTemplatePeer.setPeer(getAssetTypeTemplate(peerDto.getPeerId(), false));
                assetTypeTemplatePeerService.createAssetTypeTemplatePeer(assetTypeTemplate, assetTypeTemplatePeer);
            }

            if (!assetTypeTemplate.getPeers().isEmpty()) {
                updateAssetTypeTemplate(assetTypeTemplate.getAssetType().getId(),
                        assetTypeTemplate.getId(), assetTypeTemplate);
            }
        });
    }

    public Set<AssetTypeTemplate> findSubsystemCandidates(final Long parentAssetTypeId,
                                                          final Long assetTypeTemplateId) {
        return assetTypeTemplateRepository.findSubsystemCandidates(parentAssetTypeId, assetTypeTemplateId);
    }

    public Set<AssetTypeTemplate> findPeerCandidates(final Long assetTypeTemplateId) {
        return assetTypeTemplateRepository.findPeerCandidates(assetTypeTemplateId, assetTypeTemplateId);
    }

    public Set<AssetTypeTemplate> getAllAssetTypeTemplates() {
        return Sets.newLinkedHashSet(assetTypeTemplateRepository.findAll(AssetTypeTemplateRepository.DEFAULT_SORT));
    }
}
