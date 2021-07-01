package io.fusion.fusionbackend.service;

import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.FieldSource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AssetSeriesDraftService {

    private final AssetTypeTemplateService assetTypeTemplateService;
    private final CompanyService companyService;

    public AssetSeriesDraftService(AssetTypeTemplateService assetTypeTemplateService, CompanyService companyService) {
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.companyService = companyService;
    }

    public AssetSeries getAssetSeriesFromAssetTypeTemplate(final Long targetCompanyId,
                                                           final Long assetTypeTemplateId) {
        final AssetTypeTemplate assetTypeTemplate =
                assetTypeTemplateService.getAssetTypeTemplate(assetTypeTemplateId, true);

        final Company targetCompany = companyService.getCompany(targetCompanyId, false);

        final AssetSeries newAssetSeries = AssetSeries.builder().build();
        newAssetSeries.copyFrom(assetTypeTemplate);

        assetTypeTemplate.getAssetSeries().add(newAssetSeries);
        newAssetSeries.setAssetTypeTemplate(assetTypeTemplate);

        newAssetSeries.setCompany(targetCompany);
        targetCompany.getAssetSeries().add(newAssetSeries);

        Set<FieldSource> newFieldSources = assetTypeTemplate.getFieldTargets().stream()
                .map(fieldTarget ->
                        FieldSource.builder()
                                .fieldTarget(fieldTarget)
                                .assetSeries(newAssetSeries)
                                .sourceUnit(fieldTarget.getField().getUnit())
                                .name(fieldTarget.getName())
                                .description(fieldTarget.getDescription())
                                .sourceSensorLabel(fieldTarget.getLabel())
                                .build())
                .collect(Collectors.toSet());
        newAssetSeries.setFieldSources(newFieldSources);
        return newAssetSeries;
    }
}
