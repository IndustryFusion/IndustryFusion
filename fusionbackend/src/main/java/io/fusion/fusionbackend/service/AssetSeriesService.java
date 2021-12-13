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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.fusion.fusionbackend.dto.AssetSeriesDto;
import io.fusion.fusionbackend.dto.FieldSourceDto;
import io.fusion.fusionbackend.dto.mappers.AssetSeriesMapper;
import io.fusion.fusionbackend.dto.mappers.FieldTargetMapper;
import io.fusion.fusionbackend.dto.mappers.UnitMapper;
import io.fusion.fusionbackend.exception.AlreadyExistsException;
import io.fusion.fusionbackend.exception.ConflictException;
import io.fusion.fusionbackend.exception.MandatoryFieldException;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.ConnectivityProtocol;
import io.fusion.fusionbackend.model.ConnectivitySettings;
import io.fusion.fusionbackend.model.ConnectivityType;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.service.ontology.OntologyBuilder;
import io.fusion.fusionbackend.repository.AssetSeriesRepository;
import io.fusion.fusionbackend.repository.ConnectivityProtocolRepository;
import io.fusion.fusionbackend.repository.ConnectivityTypeRepository;
import io.fusion.fusionbackend.repository.FieldSourceRepository;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import org.apache.jena.ontology.OntModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetSeriesService {
    private final AssetSeriesRepository assetSeriesRepository;
    private final AssetSeriesMapper assetSeriesMapper;
    private final AssetTypeTemplateService assetTypeTemplateService;
    private final UnitMapper unitMapper;
    private final FieldSourceRepository fieldSourceRepository;
    private final CompanyService companyService;
    private final UnitService unitService;
    private final FieldSourceService fieldSourceService;
    private final FieldTargetService fieldTargetService;
    private final FieldTargetMapper fieldTargetMapper;
    private final ConnectivityTypeRepository connectivityTypeRepository;
    private final ConnectivityProtocolRepository connectivityProtocolRepository;
    private final OntologyBuilder ontologyBuilder;


    private static final Logger LOG = LoggerFactory.getLogger(AssetSeriesService.class);

    @Autowired
    public AssetSeriesService(AssetSeriesRepository assetSeriesRepository,
                              AssetSeriesMapper assetSeriesMapper,
                              AssetTypeTemplateService assetTypeTemplateService,
                              UnitMapper unitMapper,
                              FieldSourceRepository fieldSourceRepository,
                              CompanyService companyService,
                              UnitService unitService,
                              FieldSourceService fieldSourceService,
                              FieldTargetService fieldTargetService,
                              FieldTargetMapper fieldTargetMapper,
                              ConnectivityTypeRepository connectivityTypeRepository,
                              ConnectivityProtocolRepository connectivityProtocolRepository,
                              OntologyBuilder ontologyBuilder) {
        this.assetSeriesRepository = assetSeriesRepository;
        this.assetSeriesMapper = assetSeriesMapper;
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.unitMapper = unitMapper;
        this.fieldSourceRepository = fieldSourceRepository;
        this.companyService = companyService;
        this.unitService = unitService;
        this.fieldSourceService = fieldSourceService;
        this.fieldTargetService = fieldTargetService;
        this.fieldTargetMapper = fieldTargetMapper;
        this.connectivityTypeRepository = connectivityTypeRepository;
        this.connectivityProtocolRepository = connectivityProtocolRepository;
        this.ontologyBuilder = ontologyBuilder;
    }

    public Set<AssetSeries> getAssetSeriesSetByCompany(final Long companyId) {
        return assetSeriesRepository.findAllByCompanyId(AssetSeriesRepository.DEFAULT_SORT, companyId);
    }

    public AssetSeries getAssetSeriesByCompany(final Long companyId, final Long assetSeriesId) {
        return assetSeriesRepository.findByCompanyIdAndId(companyId, assetSeriesId)
                .orElseThrow(ResourceNotFoundException::new);
    }

    public AssetSeries getAssetSeriesByCompanyAndGlobalId(final Long companyId, final String assetSeriesGlobalId) {
        return assetSeriesRepository.findByCompanyIdAndGlobalId(companyId, assetSeriesGlobalId)
                .orElseThrow(ResourceNotFoundException::new);
    }

    @Transactional
    public AssetSeries createAssetSeries(final Long targetCompanyId,
                                         final Long assetTypeTemplateId,
                                         final Long connectivityTypeId,
                                         final Long connectivityProtocolId,
                                         final AssetSeries assetSeries) {

        boolean wasGlobalIdsUnset = false;
        if (assetSeries.getGlobalId() == null) {
            assetSeries.setGlobalId(UUID.randomUUID().toString());
            for (FieldSource fieldSource : assetSeries.getFieldSources()) {
                fieldSource.setGlobalId(UUID.randomUUID().toString());
            }
            wasGlobalIdsUnset = true;
        }

        validate(assetSeries);

        final AssetTypeTemplate assetTypeTemplate =
                assetTypeTemplateService.getAssetTypeTemplate(assetTypeTemplateId, true);

        final Company targetCompany = companyService.getCompany(targetCompanyId, false);

        assetSeries.setCompany(targetCompany);
        assetSeries.setAssetTypeTemplate(assetTypeTemplate);

        assetSeries.getFieldSources().forEach(fieldSource -> {
            fieldSource.setAssetSeries(assetSeries);
            Unit unit = unitService.getUnit(fieldSource.getSourceUnit().getId());
            fieldSource.setSourceUnit(unit);
        });

        ConnectivityType connectivityType =
                connectivityTypeRepository.findById(connectivityTypeId).orElseThrow();
        ConnectivityProtocol connectivityProtocol =
                connectivityProtocolRepository.findById(connectivityProtocolId).orElseThrow();

        ConnectivitySettings connectivitySettings = assetSeries.getConnectivitySettings();
        connectivitySettings.setConnectivityType(connectivityType);
        connectivitySettings.setConnectivityProtocol(connectivityProtocol);

        AssetSeries persistedAssetSeries = assetSeriesRepository.save(assetSeries);
        if (wasGlobalIdsUnset) {
            persistedAssetSeries.setGlobalId(generateGlobalId(targetCompanyId, persistedAssetSeries.getId()));
            for (FieldSource fieldSource : persistedAssetSeries.getFieldSources()) {
                fieldSource.setGlobalId(fieldSourceService.generateGlobalId(fieldSource));
            }
        }
        return persistedAssetSeries;
    }

    private String generateGlobalId(final Long companyId, final Long assetId) {
        return companyId + "/" + assetId;
    }

    public AssetSeries updateAssetSeries(final Long companyId, final Long assetSeriesId,
                                         final AssetSeries sourceAssetSeries) {
        final AssetSeries targetAssetSeries = getAssetSeriesByCompany(companyId, assetSeriesId);

        validate(sourceAssetSeries);

        validateForUpdates(sourceAssetSeries, targetAssetSeries);

        List<FieldSource> deletedFieldSources = targetAssetSeries.calculateDeletedFieldSources(sourceAssetSeries);

        deletedFieldSources.forEach(fieldSourceService::delete);

        targetAssetSeries.copyFrom(sourceAssetSeries);

        return targetAssetSeries;
    }

    private void validateForUpdates(AssetSeries sourceAssetSeries, AssetSeries targetAssetSeries) {
        if (!targetAssetSeries.isConnectivitySettingsUnchanged(sourceAssetSeries)) {
            throw new RuntimeException("It is not allowed to change the connectivity settings.");
        }
    }

    private void validate(AssetSeries sourceAssetSeries) {
        if (sourceAssetSeries.getGlobalId() == null) {
            throw new RuntimeException("Global id has to exist in an asset series");
        }
        if (sourceAssetSeries.getConnectivitySettings() == null) {
            throw new RuntimeException("There must be connectivity settings for every asset series");
        }
    }

    public void deleteAssetSeries(final Long companyId, final Long assetSeriesId) {
        final AssetSeries assetSeries = getAssetSeriesByCompany(companyId, assetSeriesId);

        if (assetSeries.getAssets().size() > 0) {
            LOG.warn("User try to delete assetSeries({}) with {} assets associated with",
                    assetSeries.getId(), assetSeries.getAssets().size());

            throw new ConflictException();
        }

        assetSeries.getCompany().getAssetSeries().remove(assetSeries);
        assetSeries.setCompany(null);

        assetSeries.getAssetTypeTemplate().getAssetSeries().remove(assetSeries);
        assetSeries.setAssetTypeTemplate(null);

        fieldSourceRepository.deleteAll(assetSeries.getFieldSources());

        assetSeriesRepository.delete(assetSeries);
    }

    public Set<FieldSource> getFieldSources(final Long companyId, final Long assetSeriesId) {
        final AssetSeries assetSeries = getAssetSeriesByCompany(companyId, assetSeriesId);
        return assetSeries.getFieldSources();
    }

    public FieldSource getFieldSource(final Long companyId, final Long assetSeriesId, final Long fieldSourceId) {
        final AssetSeries assetSeries = getAssetSeriesByCompany(companyId, assetSeriesId);
        return assetSeries.getFieldSources().stream()
                .filter(fieldSource -> fieldSource.getId().equals(fieldSourceId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
    }

    public FieldSource getFieldSourceByGlobalId(final Long companyId,
                                                final String assetSeriesGlobalId,
                                                final String fieldSourceGlobalId) {
        final AssetSeries assetSeries = getAssetSeriesByCompanyAndGlobalId(companyId, assetSeriesGlobalId);
        return assetSeries.getFieldSources().stream()
                .filter(fieldSource -> fieldSource.getGlobalId().equals(fieldSourceGlobalId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
    }

    public FieldSource createFieldSource(final Long companyId, final Long assetSeriesId, final Long fieldTargetId,
                                         final Long unitId, final FieldSource fieldSource) {
        final AssetSeries assetSeries = getAssetSeriesByCompany(companyId, assetSeriesId);
        final FieldTarget fieldTarget = assetSeries.getAssetTypeTemplate().getFieldTargets().stream()
                .filter(target -> target.getId().equals(fieldTargetId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
        final Unit unit = unitService.getUnit(unitId);

        if (assetSeries.getFieldSources().stream()
                .anyMatch(source -> fieldSource.getFieldTarget().getId().equals(fieldTargetId))) {
            // There is already another fieldSource connected to this fieldTarget of the ATT
            throw new AlreadyExistsException();
        }

        fieldSource.setFieldTarget(fieldTarget);
        fieldSource.setAssetSeries(assetSeries);
        fieldSource.setSourceUnit(unit);
        assetSeries.getFieldSources().add(fieldSource);

        return fieldSourceRepository.save(fieldSource);
    }

    public FieldSource updateFieldSource(final Long companyId, final Long assetSeriesId,
                                         final Long fieldSourceId,
                                         final FieldSource fieldSource) {
        final FieldSource targetFieldSource = getFieldSource(companyId, assetSeriesId, fieldSourceId);

        targetFieldSource.copyFrom(fieldSource);

        return targetFieldSource;
    }

    public void deleteFieldSource(final Long companyId, final Long assetSeriesId, final Long fieldSourceId) {
        final FieldSource fieldSource = getFieldSource(companyId, assetSeriesId, fieldSourceId);

        if (fieldSource.getFieldTarget().getMandatory() != null && fieldSource.getFieldTarget().getMandatory()) {
            throw new MandatoryFieldException();
        }

        fieldSource.getAssetSeries().getFieldSources().remove(fieldSource);

        fieldSourceRepository.delete(fieldSource);
    }

    public void linkUnitToFieldSource(final Long companyId, final Long assetSeriesId, final Long fieldSourceId,
                                      final Long unitId) {
        final FieldSource fieldSource = getFieldSource(companyId, assetSeriesId, fieldSourceId);
        final Unit unit = unitService.getUnit(unitId);

        fieldSource.setSourceUnit(unit);
    }

    public OntModel getAssetSeriesRdf(Long assetSeriesId, Long companyId) {
        AssetSeries assetSeries = getAssetSeriesByCompany(companyId, assetSeriesId);
        return ontologyBuilder.buildAssetSeriesOntology(assetSeries);
    }

    public byte[] exportAllToJson(final Long companyId) throws IOException {
        Set<AssetSeries> assetSeries = assetSeriesRepository
                .findAllByCompanyId(AssetSeriesRepository.DEFAULT_SORT, companyId);

        Set<AssetSeriesDto> assetSeriesDtos = assetSeriesMapper.toDtoSet(assetSeries, true);
        return exportAssetSeriesDtosToJson(assetSeriesDtos);
    }

    public byte[] exportAssetSeriesToJson(final Long companyId, final Long assetSeriesId) throws IOException {
        AssetSeries assetSeries = assetSeriesRepository.findByCompanyIdAndId(companyId, assetSeriesId).orElseThrow();

        Set<AssetSeriesDto> assetSeriesDtos = new LinkedHashSet<>();
        assetSeriesDtos.add(assetSeriesMapper.toDto(assetSeries, true));
        return exportAssetSeriesDtosToJson(assetSeriesDtos);
    }

    private byte[] exportAssetSeriesDtosToJson(Set<AssetSeriesDto> assetSeriesDtos) throws JsonProcessingException {
        assetSeriesDtos = removeUnnecessaryItems(assetSeriesDtos);
        sortFieldSources(assetSeriesDtos);

        ObjectMapper objectMapper = BaseZipImportExport.getNewObjectMapper();
        return objectMapper.writeValueAsBytes(BaseZipImportExport.toSortedList(assetSeriesDtos));
    }

    private Set<AssetSeriesDto> removeUnnecessaryItems(Set<AssetSeriesDto> assetSeriesDtos) {
        Set<AssetSeriesDto> resultAssetSeriesDtos = new LinkedHashSet<>();
        for (AssetSeriesDto assetSeriesDto : assetSeriesDtos) {
            assetSeriesDto.setCompanyId(null);
            assetSeriesDto.getFieldSources().forEach(fieldSourceDto -> {
                fieldSourceDto.setFieldTarget(null);
                fieldSourceDto.setSourceUnit(null);
            });
            resultAssetSeriesDtos.add(assetSeriesDto);
        }
        return resultAssetSeriesDtos;
    }

    private void sortFieldSources(Set<AssetSeriesDto> assetSeriesDtos) {
        for (AssetSeriesDto assetSeriesDto : assetSeriesDtos) {
            assetSeriesDto.setFieldSourceIds(null);
            Set<FieldSourceDto> sortedFieldSourceDtos = new LinkedHashSet<>(BaseZipImportExport
                    .toSortedList(assetSeriesDto.getFieldSources()));
            assetSeriesDto.setFieldSources(sortedFieldSourceDtos);
        }
    }

    public int importMultipleFromJson(byte[] fileContent, final Long companyId) throws IOException {
        Set<AssetSeriesDto> assetSeriesDtos = BaseZipImportExport.fileContentToDtoSet(fileContent,
                new TypeReference<>() {});
        Set<String> existingGlobalAssetSeriesIds = assetSeriesRepository
                .findAllByCompanyId(AssetSeriesRepository.DEFAULT_SORT, companyId)
                .stream().map(AssetSeries::getGlobalId).collect(Collectors.toSet());

        int entitySkippedCount = 0;
        for (AssetSeriesDto assetSeriesDto : BaseZipImportExport.toSortedList(assetSeriesDtos)) {
            if (!existingGlobalAssetSeriesIds.contains(assetSeriesDto.getGlobalId())) {

                addBaseUnitToFieldSourceDtos(assetSeriesDto);
                addFieldTargetToFieldSourceDtos(assetSeriesDto);
                sortFieldSourcesInAssetSeriesDto(assetSeriesDto);

                AssetSeries assetSeries = assetSeriesMapper.toEntity(assetSeriesDto);

                // Info: Field sources are created automatically with cascade-all
                createAssetSeries(companyId,
                        assetSeriesDto.getAssetTypeTemplateId(),
                        assetSeriesDto.getConnectivitySettings().getConnectivityTypeId(),
                        assetSeriesDto.getConnectivitySettings().getConnectivityProtocolId(),
                        assetSeries);
            } else {
                LOG.warn("Asset series with the id " + assetSeriesDto.getId() + " already exists. Entry is ignored.");
                entitySkippedCount += 1;
            }
        }

        return entitySkippedCount;
    }

    private void addBaseUnitToFieldSourceDtos(AssetSeriesDto assetSeriesDto) {
        for (FieldSourceDto fieldSourceDto : assetSeriesDto.getFieldSources()) {
            fieldSourceDto.setSourceUnit(unitMapper.toDto(unitService.getUnit(fieldSourceDto.getSourceUnitId()),
                    false));
        }
    }

    private void addFieldTargetToFieldSourceDtos(AssetSeriesDto assetSeriesDto) {
        for (FieldSourceDto fieldSourceDto : assetSeriesDto.getFieldSources()) {
            FieldTarget fieldTarget = fieldTargetService.getFieldTarget(assetSeriesDto.getAssetTypeTemplateId(),
                    fieldSourceDto.getFieldTargetId());
            fieldSourceDto.setFieldTarget(fieldTargetMapper.toDto(fieldTarget, false));
        }
    }

    private void sortFieldSourcesInAssetSeriesDto(AssetSeriesDto assetSeriesDto) {
        Set<FieldSourceDto> sortedFieldSourceDtos =
                new LinkedHashSet<>(BaseZipImportExport.toSortedList(assetSeriesDto.getFieldSources()));
        assetSeriesDto.setFieldSources(sortedFieldSourceDtos);
    }
}
