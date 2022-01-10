package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.AssetTypeTemplatePeer;

public class AssetTypeTemplatePeerBuilder implements Builder<AssetTypeTemplatePeer> {

    private AssetTypeTemplate assetTypeTemplate;
    private AssetTypeTemplate peer;

    private AssetTypeTemplatePeerBuilder() {
    }

    public static AssetTypeTemplatePeerBuilder anAssetTypeTemplatePeer() {
        return new AssetTypeTemplatePeerBuilder();
    }

    public AssetTypeTemplatePeerBuilder forAssetTypeTemplate(AssetTypeTemplate assetTypeTemplate) {
        this.assetTypeTemplate = assetTypeTemplate;
        return this;
    }

    public AssetTypeTemplatePeerBuilder asPeerTo(AssetTypeTemplate peerAssetTypeTemplate) {
        this.peer = peerAssetTypeTemplate;
        return this;
    }

    @Override
    public AssetTypeTemplatePeer build() {
        AssetTypeTemplatePeer assetTypeTemplatePeer = new AssetTypeTemplatePeer();

        if (peer == null) {
            peer = AssetTypeTemplateBuilder.anAssetTypeTemplate().build();
        }
        assetTypeTemplatePeer.setPeer(peer);

        if (assetTypeTemplate == null) {
            assetTypeTemplate = AssetTypeTemplateBuilder.anAssetTypeTemplate().build();
        } else {
            assetTypeTemplate.getPeers().add(assetTypeTemplatePeer);
        }
        assetTypeTemplatePeer.setAssetTypeTemplate(assetTypeTemplate);

        return assetTypeTemplatePeer;
    }
}
