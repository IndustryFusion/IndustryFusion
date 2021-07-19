package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;

public class AssetBuilder implements Builder<Asset> {

    private Builder<AssetSeries> assetSeriesBuilder = AssetSeriesBuilder.anAssetSeries();
    private Builder<Company> companyBuilder = CompanyBuilder.aCompany();

    private AssetBuilder() {
    }

    public static AssetBuilder anAsset() {
        return new AssetBuilder();
    }

    public AssetBuilder basedOnSeries(Builder<AssetSeries> assetSeriesBuilder) {
        this.assetSeriesBuilder = assetSeriesBuilder;
        return this;
    }

    @Override
    public Asset build() {
        Asset asset = new Asset();

        AssetSeries assetSeries = assetSeriesBuilder.build();
        asset.setAssetSeries(assetSeries);
        assetSeries.getAssets().add(asset);

        Company company = companyBuilder.build();
        asset.setCompany(company);
        company.getAssets().add(asset);

        return asset;
    }

    public AssetBuilder forCompany(Builder<Company> companyBuilder) {
        this.companyBuilder = companyBuilder;
        return this;
    }
}
