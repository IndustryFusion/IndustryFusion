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
import io.fusion.fusionbackend.dto.AssetTypeTemplateDto;
import io.fusion.fusionbackend.dto.FieldTargetDto;
import io.fusion.fusionbackend.dto.mappers.AssetTypeTemplateMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.BaseEntity;
import io.fusion.fusionbackend.model.enums.PublicationState;
import io.fusion.fusionbackend.service.ontology.OntologyBuilder;
import io.fusion.fusionbackend.repository.AssetTypeTemplateRepository;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import org.apache.jena.ontology.OntModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
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
public class AssetTypeTemplateService {
    private final AssetTypeTemplateRepository assetTypeTemplateRepository;
    private final AssetTypeService assetTypeService;
    private final AssetTypeTemplateMapper assetTypeTemplateMapper;
    private final FieldTargetService fieldTargetService;
    private final OntologyBuilder ontologyBuilder;

    private static final Logger LOG = LoggerFactory.getLogger(AssetTypeTemplateService.class);

    @Autowired
    public AssetTypeTemplateService(AssetTypeTemplateRepository assetTypeTemplateRepository,
                                    AssetTypeService assetTypeService,
                                    AssetTypeTemplateMapper assetTypeTemplateMapper,
                                    @Lazy FieldTargetService fieldTargetService,
                                    OntologyBuilder ontologyBuilder) {
        this.assetTypeTemplateRepository = assetTypeTemplateRepository;
        this.assetTypeService = assetTypeService;
        this.assetTypeTemplateMapper = assetTypeTemplateMapper;
        this.fieldTargetService = fieldTargetService;
        this.ontologyBuilder = ontologyBuilder;
    }

    public Set<AssetTypeTemplate> getAssetTypeTemplates() {
        return assetTypeTemplateRepository.findAll(AssetTypeTemplateRepository.DEFAULT_SORT);
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
        LOG.debug("AssetTypeTemplate with ID {} not found", assetTypeTemplateId);
        return ResourceNotFoundException::new;
    }

    public AssetTypeTemplate createAssetTypeTemplate(final Long assetTypeId,
                                                     final AssetTypeTemplate assetTypeTemplate) {
        final AssetType assetType = assetTypeService.getAssetType(assetTypeId);

        validate(assetTypeTemplate, assetType);

        assetTypeTemplate.setAssetType(assetType);

        return assetTypeTemplateRepository.save(assetTypeTemplate);
    }

    private void validate(AssetTypeTemplate assetTypeTemplate, AssetType assetType) {
        Objects.requireNonNull(assetTypeTemplate.getPublicationState(), "Publication state must be set but is null.");

        if (assetTypeTemplate.getPublicationState().equals(PublicationState.PUBLISHED)) {
            Objects.requireNonNull(assetTypeTemplate.getPublishedDate(),
                    "Published date must be set for publication state PUBLISHED");
        } else if (assetTypeTemplate.getPublicationState().equals(PublicationState.DRAFT)) {
            if (Objects.nonNull(assetTypeTemplate.getPublishedDate())) {
                throw new RuntimeException("Published date not allowed for publication state DRAFT");
            }
        } else {
            throw new RuntimeException("Unknown publication state: " + assetTypeTemplate.getPublicationState());
        }

        if (assetType != null && existsDraftToAssetType(assetType)) {
            String exception = "It is forbidden to create a new asset type template draft if another one exists.";
            throw new RuntimeException(exception);
        }

        validateSubsystems(assetTypeTemplate, assetType);
        validatePeers(assetTypeTemplate);
    }

    private void validateSubsystems(final AssetTypeTemplate assetTypeTemplate, final AssetType assetType) {
        for (AssetTypeTemplate subsystem : assetTypeTemplate.getSubsystems()) {
            if (subsystem.getId().equals(assetTypeTemplate.getId())) {
                throw new RuntimeException("An asset type template is not allowed to be a subsystem of itself.");
            }
            if (subsystem.getAssetType().getId().equals(assetType.getId())) {
                throw new RuntimeException("A subsystem has to be of another asset type than the parent template.");
            }
            if (assetTypeTemplateRepository.findAllPeerIds().contains(subsystem.getId())) {
                throw new RuntimeException("An asset type template can not be a subsystem if already used as peer.");
            }
            if (subsystem.getPublicationState().equals(PublicationState.DRAFT)) {
                throw new RuntimeException("A subsystem has to be a published asset type template.");
            }
        }
    }

    private void validatePeers(final AssetTypeTemplate assetTypeTemplate) {
        for (AssetTypeTemplate peer : assetTypeTemplate.getPeers()) {
            if (peer.getId().equals(assetTypeTemplate.getId())) {
                throw new RuntimeException("An asset type template is not allowed to be a peer to itself.");
            }
            if (assetTypeTemplateRepository.findAllSubsystemIds().contains(peer.getId())) {
                throw new RuntimeException("An asset type template peer is not allowed to be a subsystem.");
            }
            if (peer.getPublicationState().equals(PublicationState.DRAFT)) {
                throw new RuntimeException("A peer has to be a published asset type template.");
            }
        }
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

    public AssetTypeTemplate updateAssetTypeTemplate(final Long assetTypeTemplateId,
                                                     final AssetTypeTemplate sourceAssetTypeTemplate) {
        final AssetTypeTemplate targetAssetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);

        targetAssetTypeTemplate.copyFrom(sourceAssetTypeTemplate);

        return targetAssetTypeTemplate;
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

    public void deleteAssetTypeTemplate(final Long assetTypeTemplateId) {

        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId,
                false);

        assetTypeTemplateRepository.delete(assetTypeTemplate);
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

    public OntModel getAssetTypeTemplateRdf(Long assetTypeTemplateId) throws IOException {
        AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        OntModel model = ontologyBuilder.buildAssetTypeTemplateOntology(assetTypeTemplate);
        return model;
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
        objectMapper.writeValue(writer, assetTypeTemplate);
    }

    public byte[] exportAllToJson() throws IOException {
        Set<AssetTypeTemplate> assetTypeTemplates = assetTypeTemplateRepository
                .findAll(AssetTypeTemplateRepository.DEFAULT_SORT)
                .stream().filter(assetTypeTemplate -> assetTypeTemplate.getPublishedDate() != null)
                .collect(Collectors.toSet());

        Set<AssetTypeTemplateDto> publishedAssetTypeTemplatesDtos = assetTypeTemplateMapper
                .toDtoSet(assetTypeTemplates, true);
        sortFieldTargets(publishedAssetTypeTemplatesDtos);

        ObjectMapper objectMapper = BaseZipImportExport.getNewObjectMapper();
        return objectMapper.writeValueAsBytes(BaseZipImportExport.toSortedList(publishedAssetTypeTemplatesDtos));
    }

    private void sortFieldTargets(Set<AssetTypeTemplateDto> publishedAssetTypeTemplatesDtos) {
        for (AssetTypeTemplateDto publishedAssetTypeTemplatesDto : publishedAssetTypeTemplatesDtos) {
            publishedAssetTypeTemplatesDto.setFieldTargetIds(null);
            Set<FieldTargetDto> sortedFieldTargetDtos = new LinkedHashSet<>(BaseZipImportExport
                    .toSortedList(publishedAssetTypeTemplatesDto.getFieldTargets()));
            publishedAssetTypeTemplatesDto.setFieldTargets(sortedFieldTargetDtos);
        }
    }

    public int importMultipleFromJson(byte[] fileContent) throws IOException {
        Set<AssetTypeTemplateDto> assetTypeTemplateDtos = BaseZipImportExport.fileContentToDtoSet(fileContent,
                new TypeReference<>() {});
        Set<Long> existingAssetTypeTemplateIds = assetTypeTemplateRepository
                .findAll(AssetTypeTemplateRepository.DEFAULT_SORT)
                .stream().map(BaseEntity::getId).collect(Collectors.toSet());

        Map<Long, Set<Long>> assetTypeTemplateSubsystemMap = new HashMap<>();

        int entitySkippedCount = 0;
        for (AssetTypeTemplateDto assetTypeTemplateDto : BaseZipImportExport.toSortedList(assetTypeTemplateDtos)) {
            if (!existingAssetTypeTemplateIds.contains(assetTypeTemplateDto.getId())) {
                removeAndCacheSubsystems(assetTypeTemplateSubsystemMap, assetTypeTemplateDto);

                AssetTypeTemplate assetTypeTemplate = assetTypeTemplateMapper.toEntity(assetTypeTemplateDto);
                assetTypeTemplate.setFieldTargets(new LinkedHashSet<>());
                createAssetTypeTemplate(assetTypeTemplateDto.getAssetTypeId(), assetTypeTemplate);
            } else {
                LOG.warn("Asset type template  with the id " + assetTypeTemplateDto.getId()
                        + " already exists. Entry is ignored.");
                entitySkippedCount += 1;
            }
        }

        fieldTargetService.createFieldTargetsFromAssetTypeTemplateDtos(assetTypeTemplateDtos);
        addCachedSubsystemsToAssetTypeTemplates(assetTypeTemplateSubsystemMap);

        return entitySkippedCount;
    }

    private void removeAndCacheSubsystems(final Map<Long, Set<Long>> assetTypeTemplateSubsystemMap,
                                          final AssetTypeTemplateDto assetTypeTemplateDto) {
        assetTypeTemplateSubsystemMap.put(assetTypeTemplateDto.getId(), assetTypeTemplateDto.getSubsystemIds());
        assetTypeTemplateDto.setSubsystemIds(null);
    }

    private void addCachedSubsystemsToAssetTypeTemplates(final Map<Long, Set<Long>> assetTypeTemplateSubsystemMap) {

        assetTypeTemplateSubsystemMap.forEach((assetTypeTemplateId, subsystemIds) -> {
            AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
            Set<AssetTypeTemplate> subsystems = subsystemIds.stream()
                    .map(id -> getAssetTypeTemplate(id, false))
                    .collect(Collectors.toSet());

            assetTypeTemplate.setSubsystems(subsystems);
            updateAssetTypeTemplate(assetTypeTemplate.getId(), assetTypeTemplate);
        });
    }

    public Set<AssetTypeTemplate> findPeerCandidates(final Long assetTypeTemplateId) {
        return assetTypeTemplateRepository.findPeerCandidates(assetTypeTemplateId);
    }
}
