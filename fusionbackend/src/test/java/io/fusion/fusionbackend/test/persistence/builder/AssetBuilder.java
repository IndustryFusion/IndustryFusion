package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;

public class AssetBuilder implements Builder<Asset> {

    private Builder<AssetSeries> assetSeriesBuilder = AssetSeriesBuilder.anAssetSeries();
    private Asset parentAsset;
    private Company company;

    private AssetBuilder() {
    }

    public static AssetBuilder anAsset() {
        return new AssetBuilder();
    }

    public AssetBuilder basedOnSeries(Builder<AssetSeries> assetSeriesBuilder) {
        this.assetSeriesBuilder = assetSeriesBuilder;
        return this;
    }

    public AssetBuilder forCompany(Builder<Company> companyBuilder) {
        this.company = companyBuilder.build();
        return this;
    }

    public AssetBuilder forCompany(Company company) {
        this.company = company;
        return this;
    }

    public AssetBuilder asSubsystemOf(Asset parentAsset) {
        this.parentAsset = parentAsset;
        return this;
    }

    @Override
    public Asset build() {
        Asset asset = new Asset();

        AssetSeries assetSeries = assetSeriesBuilder.build();
        asset.setAssetSeries(assetSeries);
        assetSeries.getAssets().add(asset);

        asset.setCompany(company);
        company.getAssets().add(asset);

        if (parentAsset != null) {
            parentAsset.getSubsystems().add(asset);
        }

        return asset;
    }
}
