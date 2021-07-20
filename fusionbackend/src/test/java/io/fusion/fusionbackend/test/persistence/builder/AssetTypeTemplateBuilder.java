package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;

public class AssetTypeTemplateBuilder implements Builder<AssetTypeTemplate> {

    private Builder<AssetType> assetTypeBuilder = AssetTypeBuilder.anAssetType();

    private AssetTypeTemplateBuilder() {
    }

    public static AssetTypeTemplateBuilder anAssetTypeTemplate() {
        return new AssetTypeTemplateBuilder();
    }

    public AssetTypeTemplateBuilder forType(Builder<AssetType> assetTypeBuilder) {
        this.assetTypeBuilder = assetTypeBuilder;
        return this;
    }

    @Override
    public AssetTypeTemplate build() {
        AssetTypeTemplate assetTypeTemplate = new AssetTypeTemplate();
        assetTypeTemplate.setAssetType(assetTypeBuilder.build());

        return assetTypeTemplate;
    }
}
