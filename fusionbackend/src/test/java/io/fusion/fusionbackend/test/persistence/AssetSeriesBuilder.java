package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Company;

public class AssetSeriesBuilder implements Builder<AssetSeries> {

    private Builder<Company> companyBuilder = CompanyBuilder.aCompany();
    private Builder<AssetTypeTemplate> assetTypeTemplateBuilder = AssetTypeTemplateBuilder.anAssetTypeTemplate();

    public static AssetSeriesBuilder anAssetSeries() {
        return new AssetSeriesBuilder();
    }

    public AssetSeriesBuilder forCompany(Builder<Company> companyBuilder) {
        this.companyBuilder = companyBuilder;
        return this;

    }

    public Builder<AssetSeries> basedOnTemplate(Builder<AssetTypeTemplate> assetTypeTemplateBuilder) {
        this.assetTypeTemplateBuilder = assetTypeTemplateBuilder;
        return this;
    }

    @Override
    public AssetSeries build() {
        AssetSeries assetSeries = new AssetSeries();

        Company company = companyBuilder.build();
        assetSeries.setCompany(company);
        company.getAssetSeries().add(assetSeries);

        AssetTypeTemplate assetTypeTemplate = assetTypeTemplateBuilder.build();
        assetSeries.setAssetTypeTemplate(assetTypeTemplate);
        assetTypeTemplate.getAssetSeries().add(assetSeries);

        return assetSeries;
    }
}
