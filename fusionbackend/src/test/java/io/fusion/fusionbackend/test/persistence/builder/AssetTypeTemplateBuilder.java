package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;

public class AssetTypeTemplateBuilder implements Builder<AssetTypeTemplate> {

    private AssetTypeTemplate parentAssetTypeTemplate;
    private AssetType assetType;

    private AssetTypeTemplateBuilder() {
    }

    public static AssetTypeTemplateBuilder anAssetTypeTemplate() {
        return new AssetTypeTemplateBuilder();
    }

    public AssetTypeTemplateBuilder forType(Builder<AssetType> assetTypeBuilder) {
        this.assetType = assetTypeBuilder.build();
        return this;
    }

    public AssetTypeTemplateBuilder forType(AssetType assetType) {
        this.assetType = assetType;
        return this;
    }

    public AssetTypeTemplateBuilder asSubsystemOf(AssetTypeTemplate parentAssetTypeTemplate) {
        this.parentAssetTypeTemplate = parentAssetTypeTemplate;
        return this;
    }

    @Override
    public AssetTypeTemplate build() {
        AssetTypeTemplate assetTypeTemplate = new AssetTypeTemplate();

        if (assetType == null) {
            assetType = AssetTypeBuilder.anAssetType().build();
        }
        assetTypeTemplate.setAssetType(assetType);

        if (parentAssetTypeTemplate != null) {
            parentAssetTypeTemplate.getSubsystems().add(assetTypeTemplate);
        }

        return assetTypeTemplate;
    }
}
