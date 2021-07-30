package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Company;

public class AssetSeriesBuilder implements Builder<AssetSeries> {

    private Builder<AssetTypeTemplate> assetTypeTemplateBuilder = AssetTypeTemplateBuilder.anAssetTypeTemplate();
    private Company company;

    private AssetSeriesBuilder() {
    }

    public static AssetSeriesBuilder anAssetSeries() {
        return new AssetSeriesBuilder();
    }

    public AssetSeriesBuilder forCompany(Builder<Company> companyBuilder) {
        this.company = companyBuilder.build();
        return this;

    }

    public AssetSeriesBuilder forCompany(Company company) {
        this.company = company;
        return this;

    }

    public Builder<AssetSeries> basedOnTemplate(Builder<AssetTypeTemplate> assetTypeTemplateBuilder) {
        this.assetTypeTemplateBuilder = assetTypeTemplateBuilder;
        return this;
    }

    @Override
    public AssetSeries build() {
        AssetSeries assetSeries = new AssetSeries();

        if (company == null) {
            company = CompanyBuilder.aCompany().build();
        }
        assetSeries.setCompany(company);
        company.getAssetSeries().add(assetSeries);

        AssetTypeTemplate assetTypeTemplate = assetTypeTemplateBuilder.build();
        assetSeries.setAssetTypeTemplate(assetTypeTemplate);
        assetTypeTemplate.getAssetSeries().add(assetSeries);

        return assetSeries;
    }
}
