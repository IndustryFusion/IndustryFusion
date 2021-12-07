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
import io.fusion.fusionbackend.model.BaseEntity;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.ConnectivityProtocol;
import io.fusion.fusionbackend.model.ConnectivitySettings;
import io.fusion.fusionbackend.model.ConnectivityType;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.ontology.OntologyBuilder;
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
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetSeriesService {
    private static final Logger LOG = LoggerFactory.getLogger(AssetSeriesService.class);
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

    @Transactional
    public AssetSeries createAssetSeries(final Long targetCompanyId,
                                         final Long assetTypeTemplateId,
                                         final Long connectivityTypeId,
                                         final Long connectivityProtocolId,
                                         final AssetSeries assetSeries) {

        validate(assetSeries);

        final AssetTypeTemplate assetTypeTemplate =
                assetTypeTemplateService.getAssetTypeTemplate(assetTypeTemplateId, true);

        final Company targetCompany = companyService.getCompany(targetCompanyId, false);

        assetSeries.setCompany(targetCompany);
        assetSeries.setAssetTypeTemplate(assetTypeTemplate);

        assetSeries.getFieldSources().forEach(fieldSource -> {
            fieldSource.setAssetSeries(assetSeries);
            if (fieldSource.getSourceUnit() != null) {
                Unit unit = unitService.getUnit(fieldSource.getSourceUnit().getId());
                fieldSource.setSourceUnit(unit);
            }
        });

        ConnectivityType connectivityType =
                connectivityTypeRepository.findById(connectivityTypeId).orElseThrow();
        ConnectivityProtocol connectivityProtocol =
                connectivityProtocolRepository.findById(connectivityProtocolId).orElseThrow();

        ConnectivitySettings connectivitySettings = assetSeries.getConnectivitySettings();
        connectivitySettings.setConnectivityType(connectivityType);
        connectivitySettings.setConnectivityProtocol(connectivityProtocol);

        return assetSeriesRepository.save(assetSeries);
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
        if (sourceAssetSeries.getConnectivitySettings() == null) {
            throw new RuntimeException("There must be connectivity settings for every asset series");
        }
    }

    public void deleteAssetSeries(final Long companyId, final Long assetSeriesId) {
        final AssetSeries assetSeries = getAssetSeriesByCompany(companyId, assetSeriesId);

        if (!assetSeries.getAssets().isEmpty()) {
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

        Set<AssetSeriesDto> assetSeriesDtos = assetSeriesMapper.toDtoSet(assetSeries, true)
                .stream().peek(assetSeriesDto -> {
                    assetSeriesDto.setCompanyId(null);
                    assetSeriesDto.getFieldSources().forEach(fieldSourceDto -> {
                        fieldSourceDto.setFieldTarget(null);
                        fieldSourceDto.setSourceUnit(null);
                    });
                })
                .collect(Collectors.toSet());

        ObjectMapper objectMapper = BaseZipImportExport.getNewObjectMapper();
        return objectMapper.writeValueAsBytes(BaseZipImportExport.toSortedList(assetSeriesDtos));
    }
}
