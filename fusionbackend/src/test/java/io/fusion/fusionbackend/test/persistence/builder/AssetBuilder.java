package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;

public class AssetBuilder implements Builder<Asset> {

    private Asset parentAsset;
    private Company company;
    private AssetSeries assetSeries;

    private AssetBuilder() {
    }

    public static AssetBuilder anAsset() {
        return new AssetBuilder();
    }

    public AssetBuilder basedOnSeries(Builder<AssetSeries> assetSeriesBuilder) {
        this.assetSeries = assetSeriesBuilder.build();
        return this;
    }

    public AssetBuilder basedOnSeries(AssetSeries assetSeries) {
        this.assetSeries = assetSeries;
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

        if (assetSeries == null) {
            assetSeries = AssetSeriesBuilder.anAssetSeries().build();
        }
        asset.setAssetSeries(assetSeries);
        assetSeries.getAssets().add(asset);

        if (company == null) {
            company = CompanyBuilder.aCompany().build();
        }
        asset.setCompany(company);
        company.getAssets().add(asset);

        if (parentAsset != null) {
            parentAsset.getSubsystems().add(asset);
        }

        return asset;
    }
}
