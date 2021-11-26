package io.fusion.fusionbackend.test.persistence.tests;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.ConnectivityProtocol;
import io.fusion.fusionbackend.model.ConnectivityType;
import io.fusion.fusionbackend.test.persistence.PersistenceTestsBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static io.fusion.fusionbackend.test.persistence.builder.AssetBuilder.anAsset;
import static io.fusion.fusionbackend.test.persistence.builder.AssetSeriesBuilder.anAssetSeries;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeBuilder.anAssetType;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeTemplateBuilder.anAssetTypeTemplate;
import static io.fusion.fusionbackend.test.persistence.builder.CompanyBuilder.aCompany;
import static io.fusion.fusionbackend.test.persistence.builder.ConnectivityProtocolBuilder.aConnectivityProtocol;
import static io.fusion.fusionbackend.test.persistence.builder.ConnectivityTypeBuilder.aConnectivityType;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;


public class PersistenceTestsAsset extends PersistenceTestsBase {

    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    public void persistAsset() {
        ConnectivityType connectivityType = persisted(aConnectivityType()).build();
        ConnectivityProtocol connectivityProtocol = persisted(aConnectivityProtocol()).build();

        Asset asset = anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(persisted(aCompany()))
                        .withConnectivitySettingsFor(connectivityType, connectivityProtocol)
                        .basedOnTemplate(persisted(anAssetTypeTemplate()
                                .forType(persisted(anAssetType()))))))
                .forCompany(persisted(aCompany()))
                .build();

        Asset foundAsset = testEntityManager.persistFlushFind(asset);

        assertNotNull(foundAsset);
    }

    @Test
    void persistAssetWithSubsystem() {

        ConnectivityType connectivityType = persisted(aConnectivityType()).build();
        ConnectivityProtocol connectivityProtocol = persisted(aConnectivityProtocol()).build();

        Asset subsystem = persisted(anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(persisted(aCompany()))
                        .withConnectivitySettingsFor(connectivityType, connectivityProtocol)
                        .basedOnTemplate(persisted(anAssetTypeTemplate()
                                .forType(persisted(anAssetType()))))))
                .forCompany(persisted(aCompany())))
                .build();

        Asset parent = persisted(anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(persisted(aCompany()))
                        .withConnectivitySettingsFor(connectivityType, connectivityProtocol)
                        .basedOnTemplate(persisted(anAssetTypeTemplate()
                                .forType(persisted(anAssetType()))))))
                .forCompany(persisted(aCompany())))
                .build();


        parent.getSubsystems().add(subsystem);

        Asset foundParent = testEntityManager.persistFlushFind(parent);

        assertEquals(1, foundParent.getSubsystems().size());
    }
}
