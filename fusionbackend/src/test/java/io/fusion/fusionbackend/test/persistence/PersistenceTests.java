package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.ConnectivityProtocol;
import io.fusion.fusionbackend.model.ConnectivityType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static io.fusion.fusionbackend.test.persistence.builder.AssetBuilder.anAsset;
import static io.fusion.fusionbackend.test.persistence.builder.AssetSeriesBuilder.anAssetSeries;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeBuilder.anAssetType;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeTemplateBuilder.anAssetTypeTemplate;
import static io.fusion.fusionbackend.test.persistence.builder.CompanyBuilder.aCompany;
import static io.fusion.fusionbackend.test.persistence.builder.ConnectivityProtocolBuilder.aConnectivityProtocol;
import static io.fusion.fusionbackend.test.persistence.builder.ConnectivityTypeBuilder.aConnectivityType;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;


public class PersistenceTests extends PersistenceTestsBase {

    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    void persistCompany() {
        Company company = aCompany().build();

        Company foundCompany = testEntityManager.persistAndFlush(company);

        assertNotNull(foundCompany);
        assertEquals(company, foundCompany);
    }

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

    @Test
    void persistConnectivityType() {
        ConnectivityType connectivityType = aConnectivityType().build();

        ConnectivityType foundType = testEntityManager.persistFlushFind(connectivityType);

        assertNotNull(foundType);
    }

    @Test
    void persistConnectivityTypeWithProtocol() {
        ConnectivityType connectivityType = aConnectivityType()
                .withProtocol(persisted(aConnectivityProtocol()))
                .build();

        ConnectivityType foundType = testEntityManager.persistFlushFind(connectivityType);

        assertEquals(1, foundType.getAvailableProtocols().size());
    }

    @Test
    void persistAssetsSeriesWithConnectivitySettings() {
        ConnectivityType connectivityType = persisted(aConnectivityType()
                .withProtocol(persisted(aConnectivityProtocol())))
                .build();

        ConnectivityProtocol connectivityProtocol = List.copyOf(connectivityType.getAvailableProtocols()).get(0);

        AssetSeries assetSeries = anAssetSeries()
                .forCompany(persisted(aCompany()))
                .basedOnTemplate(persisted(anAssetTypeTemplate()
                        .forType(persisted(anAssetType()))))
                .withConnectivitySettingsFor(connectivityType, connectivityProtocol)
                .build();

        AssetSeries foundSeries = testEntityManager.persistFlushFind(assetSeries);

        assertNotNull(foundSeries);
        assertEquals(connectivityType, foundSeries.getConnectivitySettings().getConnectivityType());
        assertEquals(connectivityProtocol, foundSeries.getConnectivitySettings().getConnectivityProtocol());

    }

    @Test
    void persistAssetsSeriesWithConnectivitySettings_detachBeforeSave() {
        ConnectivityType connectivityType = persisted(aConnectivityType()
                .withProtocol(persisted(aConnectivityProtocol())))
                .build();

        ConnectivityProtocol connectivityProtocol = List.copyOf(connectivityType.getAvailableProtocols()).get(0);

        testEntityManager.detach(connectivityType);
        testEntityManager.detach(connectivityProtocol);

        AssetSeries assetSeries = anAssetSeries()
                .forCompany(persisted(aCompany()))
                .basedOnTemplate(persisted(anAssetTypeTemplate()
                        .forType(persisted(anAssetType()))))
                .withConnectivitySettingsFor(connectivityType, connectivityProtocol)
                .build();

        AssetSeries foundSeries = testEntityManager.persistFlushFind(assetSeries);

        assertEquals(connectivityType, foundSeries.getConnectivitySettings().getConnectivityType());
        assertEquals(connectivityProtocol, foundSeries.getConnectivitySettings().getConnectivityProtocol());
    }
}
