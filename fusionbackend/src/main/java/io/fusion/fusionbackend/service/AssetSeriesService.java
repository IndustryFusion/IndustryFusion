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

import io.fusion.fusionbackend.exception.AlreadyExistsException;
import io.fusion.fusionbackend.exception.ConflictException;
import io.fusion.fusionbackend.exception.MandatoryFieldException;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.model.FieldInstance;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.repository.AssetSeriesRepository;
import io.fusion.fusionbackend.repository.FieldSourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@Transactional
public class AssetSeriesService {
    private final AssetSeriesRepository assetSeriesRepository;
    private final AssetTypeTemplateService assetTypeTemplateService;
    private final FieldSourceRepository fieldSourceRepository;
    private final FieldSourceService fieldSourceService;
    private final CompanyService companyService;
    private final UnitService unitService;

    private static final Logger LOG = LoggerFactory.getLogger(AssetSeriesService.class);

    @Autowired
    public AssetSeriesService(AssetSeriesRepository assetSeriesRepository,
                              AssetTypeTemplateService assetTypeTemplateService,
                              FieldSourceRepository fieldSourceRepository,
                              FieldSourceService fieldSourceService,
                              CompanyService companyService,
                              UnitService unitService) {
        this.assetSeriesRepository = assetSeriesRepository;
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.fieldSourceRepository = fieldSourceRepository;
        this.fieldSourceService = fieldSourceService;
        this.companyService = companyService;
        this.unitService = unitService;
    }

    public Set<AssetSeries> getAssetSeriesSetByCompany(final Long companyId) {
        return assetSeriesRepository.findAllByCompanyId(AssetSeriesRepository.DEFAULT_SORT, companyId);
    }

    public AssetSeries getAssetSeriesByCompany(final Long companyId, final Long assetSeriesId) {
        return assetSeriesRepository.findByCompanyIdAndId(companyId, assetSeriesId)
                .orElseThrow(ResourceNotFoundException::new);
    }

    public AssetSeries createAssetSeriesFromAssetTypeTemplate(final Long targetCompanyId,
                                                              final Long assetTypeTemplateId) {
        final AssetTypeTemplate assetTypeTemplate =
                assetTypeTemplateService.getAssetTypeTemplate(assetTypeTemplateId, true);

        final Company targetCompany = companyService.getCompany(targetCompanyId, false);

        final AssetSeries newAssetSeries = AssetSeries.builder()
                .build();
        newAssetSeries.copyFrom(assetTypeTemplate);

        assetTypeTemplate.getAssetSeries().add(newAssetSeries);
        newAssetSeries.setAssetTypeTemplate(assetTypeTemplate);

        newAssetSeries.setCompany(targetCompany);
        targetCompany.getAssetSeries().add(newAssetSeries);
        final AssetSeries savedAssetSeries = assetSeriesRepository.save(newAssetSeries);

        List<FieldSource> newFieldSources = assetTypeTemplate.getFieldTargets().stream()
                .map(fieldTarget ->
                        FieldSource.builder()
                                .fieldTarget(fieldTarget)
                                .assetSeries(savedAssetSeries)
                                .sourceUnit(fieldTarget.getField().getUnit())
                                .build())
                .collect(Collectors.toList());
        List<FieldSource> savedFieldSources =
                StreamSupport.stream(fieldSourceRepository.saveAll(newFieldSources).spliterator(), false)
                        .collect(Collectors.toList());
        newAssetSeries.getFieldSources().addAll(savedFieldSources);

        return newAssetSeries;
    }

    public Asset initAssetDraft(final Long companyId, final Long assetSeriesId) {
        final AssetSeries assetSeries = getAssetSeriesByCompany(companyId, assetSeriesId);
        final Company company = assetSeries.getCompany();

        final Asset newAsset = Asset.builder()
                .ceCertified(assetSeries.getCeCertified())
                .handbookKey(assetSeries.getHandbookKey())
                .protectionClass(assetSeries.getProtectionClass())
                .videoKey(assetSeries.getVideoKey())
                .build();
        newAsset.copyFrom(assetSeries);

        newAsset.setAssetSeries(assetSeries);
        newAsset.setCompany(company);

        List<FieldInstance> newFieldInstances = assetSeries.getFieldSources().stream()
                .map(fieldSourceService::initFieldInstanceDraft)
                .collect(Collectors.toList());
        newAsset.getFieldInstances().addAll(newFieldInstances);

        return newAsset;
    }

    public AssetSeries updateAssetSeries(final Long companyId, final Long assetSeriesId,
                                         final AssetSeries sourceAssetSeries) {
        final AssetSeries targetAssetSeries = getAssetSeriesByCompany(companyId, assetSeriesId);

        targetAssetSeries.copyFrom(sourceAssetSeries);

        return targetAssetSeries;
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
                .filter(field -> field.getId().equals(fieldSourceId))
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
}
