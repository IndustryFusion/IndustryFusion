package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;

public class AssetTypeTemplateBuilder implements Builder<AssetTypeTemplate> {

    private AssetTypeTemplate parentAssetTypeTemplate;
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

    public AssetTypeTemplateBuilder asSubsystemOf(AssetTypeTemplate parentAssetTypeTemplate) {
        this.parentAssetTypeTemplate = parentAssetTypeTemplate;
        return this;
    }

    @Override
    public AssetTypeTemplate build() {
        AssetTypeTemplate assetTypeTemplate = new AssetTypeTemplate();
        assetTypeTemplate.setAssetType(assetTypeBuilder.build());

        if (parentAssetTypeTemplate != null) {
            parentAssetTypeTemplate.getSubsystems().add(assetTypeTemplate);
        }

        return assetTypeTemplate;
    }
}
