package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.AssetType;

public class AssetTypeBuilder implements Builder<AssetType> {

    private AssetTypeBuilder() {
    }

    public static Builder<AssetType> anAssetType() {
        return new AssetTypeBuilder();
    }

    @Override
    public AssetType build() {
        return new AssetType();
    }
}
