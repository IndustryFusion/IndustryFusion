package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.ConnectivityProtocol;
import io.fusion.fusionbackend.model.ConnectivityType;
import io.fusion.fusionbackend.repository.CompanyRepository;
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


public class PersistenceTests extends PersistenceTestsBase {


    @Autowired
    private TestEntityManager testEntityManager;

    @Autowired
    private CompanyRepository companyRepository;

    @Test
    void persistCompany() {
        Company company = aCompany().build();

        Company foundCompany = testEntityManager.persistAndFlush(company);

        assertNotNull(foundCompany);
        assertEquals(company, foundCompany);
    }

    @Test
    public void persistAsset() {

        Asset asset = anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(persisted(aCompany()))
                        .basedOnTemplate(persisted(anAssetTypeTemplate()
                                .forType(persisted(anAssetType()))))))
                .forCompany(persisted(aCompany()))
                .build();

        Asset foundAsset = testEntityManager.persistFlushFind(asset);

        assertNotNull(foundAsset);
    }

    @Test
    void persistAssetWithSubsystem() {

        Asset subsystem = persisted(anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(persisted(aCompany()))
                        .basedOnTemplate(persisted(anAssetTypeTemplate()
                                .forType(persisted(anAssetType()))))))
                .forCompany(persisted(aCompany())))
                .build();

        Asset parent = persisted(anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(persisted(aCompany()))
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
    void persistAssestSeriesWithConnectivitySettings() {
        ConnectivityType connectivityType = persisted(aConnectivityType()
                .withProtocol(persisted(aConnectivityProtocol())))
                .build();

        ConnectivityProtocol connectivityProtocol = persisted(aConnectivityProtocol()).build();

        AssetSeries assetSeries = anAssetSeries()
                .forCompany(persisted(aCompany()))
                .basedOnTemplate(persisted(anAssetTypeTemplate()
                        .forType(persisted(anAssetType()))))
                .withConnectivitySettingsFor(connectivityType, connectivityProtocol)
                .build();

        AssetSeries foundSeries = testEntityManager.persistFlushFind(assetSeries);

        assertNotNull(foundSeries);
    }

    @Test
    void persistAssestSeriesWithConnectivitySettings_checkMergeCascadings() {
        ConnectivityType connectivityType = persisted(aConnectivityType()
                .withProtocol(persisted(aConnectivityProtocol())))
                .build();

        ConnectivityProtocol connectivityProtocol = persisted(aConnectivityProtocol()).build();

        testEntityManager.detach(connectivityType);
        testEntityManager.detach(connectivityProtocol);

        AssetSeries assetSeries = anAssetSeries()
                .forCompany(persisted(aCompany()))
                .basedOnTemplate(persisted(anAssetTypeTemplate()
                        .forType(persisted(anAssetType()))))
                .withConnectivitySettingsFor(connectivityType, connectivityProtocol)
                .build();

        AssetSeries foundSeries = testEntityManager.merge(assetSeries);

        assertNotNull(foundSeries);
    }
}