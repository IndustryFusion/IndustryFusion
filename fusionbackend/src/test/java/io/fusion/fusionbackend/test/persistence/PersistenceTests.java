package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.model.*;
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
import static io.fusion.fusionbackend.test.persistence.builder.CountryBuilder.aCountry;
import static io.fusion.fusionbackend.test.persistence.builder.FactorySiteBuilder.aFactorySite;
import static io.fusion.fusionbackend.test.persistence.builder.ShiftBuilder.aShift;
import static io.fusion.fusionbackend.test.persistence.builder.ShiftSettingsBuilder.aShiftSettings;
import static io.fusion.fusionbackend.test.persistence.builder.ShiftsOfDayBuilder.aShiftsOfDay;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;


class PersistenceTests extends PersistenceTestsBase {

    public static final String NEW_STRING_VALUE = "New String Value";
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
    void persistAsset() {
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

    @Test
    void updateAssetsSeries() {
        ConnectivityType connectivityTypeBefore = persisted(aConnectivityType()
                .withProtocol(persisted(aConnectivityProtocol())))
                .build();

        ConnectivityProtocol connectivityProtocolBefore =
                List.copyOf(connectivityTypeBefore.getAvailableProtocols()).get(0);

        AssetSeries toBeUpdatedAssetSeries = persisted(anAssetSeries()
                .forCompany(persisted(aCompany()))
                .basedOnTemplate(persisted(anAssetTypeTemplate()
                        .forType(persisted(anAssetType()))))
                .withConnectivitySettingsFor(connectivityTypeBefore, connectivityProtocolBefore))
                .build();


        ConnectivityType connectivityTypeAfter = persisted(aConnectivityType()
                .withProtocol(persisted(aConnectivityProtocol())))
                .build();

        ConnectivityProtocol connectivityProtocolAfter =
                List.copyOf(connectivityTypeAfter.getAvailableProtocols()).get(0);


        toBeUpdatedAssetSeries.getConnectivitySettings().setConnectivityType(connectivityTypeAfter);
        toBeUpdatedAssetSeries.getConnectivitySettings().setConnectivityProtocol(connectivityProtocolAfter);

        AssetSeries updatedAssetSeries = testEntityManager.persistFlushFind(toBeUpdatedAssetSeries);

        assertEquals(connectivityTypeAfter, updatedAssetSeries.getConnectivitySettings().getConnectivityType());
        assertEquals(connectivityProtocolAfter, updatedAssetSeries.getConnectivitySettings().getConnectivityProtocol());
    }

    /**
     * This is only an example test for the functionality of JPA/Hibernate itself. The intent is to show an alternative
     * to the copyFrom() approach. The latter is the current implementation for making updates.
     * <br>
     * <br>
     * This test is more an example than an automatic running unit test. Therefore, it is not written clean.
     */
    @Test
    void simulateChangesForDetachedEntities() {
        //Set-up
        ConnectivityType connectivityType = persisted(aConnectivityType()
                .withProtocol(persisted(aConnectivityProtocol())))
                .build();

        ConnectivityProtocol connectivityProtocol = connectivityType.getAvailableProtocols().iterator().next();

        AssetSeries sourceAssetSeries = persisted(anAssetSeries()
                .forCompany(persisted(aCompany()))
                .basedOnTemplate(persisted(anAssetTypeTemplate()
                        .forType(persisted(anAssetType()))))
                .withConnectivitySettingsFor(connectivityType, connectivityProtocol))
                .build();

        //Simulate frontend changes
        testEntityManager.detach(sourceAssetSeries);
        ConnectivitySettings oldConnectivitySettings = sourceAssetSeries.getConnectivitySettings();

        sourceAssetSeries.setName(NEW_STRING_VALUE);
        ConnectivityProtocol otherConnectivityProtocol = persisted(aConnectivityProtocol()).build();
        ConnectivitySettings newTransientConnectivitySettings = ConnectivitySettings.builder()
                .connectionString(NEW_STRING_VALUE)
                .connectivityType(connectivityType)
                .connectivityProtocol(otherConnectivityProtocol)
                .build();
        sourceAssetSeries.setConnectivitySettings(newTransientConnectivitySettings);

        //Simulate backend processing and assert result
        AssetSeries targetAssetSeries = testEntityManager.find(AssetSeries.class, sourceAssetSeries.getId());

        sourceAssetSeries = testEntityManager.merge(sourceAssetSeries);
        testEntityManager.flush();

        assertEquals(targetAssetSeries, sourceAssetSeries);
        assertSame(targetAssetSeries, sourceAssetSeries);

        assertEquals(NEW_STRING_VALUE, targetAssetSeries.getName());
        assertEquals(NEW_STRING_VALUE, targetAssetSeries.getConnectivitySettings().getConnectionString());
        assertEquals(otherConnectivityProtocol, targetAssetSeries.getConnectivitySettings().getConnectivityProtocol());

        //"manual" cleanup of orphans
        oldConnectivitySettings = testEntityManager.find(ConnectivitySettings.class, oldConnectivitySettings.getId());
        assertNotNull(oldConnectivitySettings);

        testEntityManager.remove(oldConnectivitySettings);
        testEntityManager.flush();
        oldConnectivitySettings = testEntityManager.find(ConnectivitySettings.class, oldConnectivitySettings.getId());
        assertNull(oldConnectivitySettings);

    }

    @Test
    void persistFactorySite() {
        FactorySite factorySite = aFactorySite()
                .forCompany(persisted(aCompany()))
                .withCountry(persisted(aCountry()))
                .withShiftSettings(persisted(aShiftSettings()).build())
                .build();

        FactorySite foundFactorySite = testEntityManager.persistFlushFind(factorySite);

        assertNotNull(foundFactorySite);
    }

    @Test
    void persistShiftSettings() {
        ShiftSettings shiftSettings = aShiftSettings().build();

        ShiftSettings foundShiftSettings = testEntityManager.persistFlushFind(shiftSettings);

        assertNotNull(foundShiftSettings);
    }

    @Test
    void persistShiftsOfDay() {
        ShiftsOfDay shiftsOfDay = aShiftsOfDay()
                .forShiftSettings(persisted(aShiftSettings()))
                .build();

        ShiftsOfDay foundShiftsOfDay = testEntityManager.persistFlushFind(shiftsOfDay);

        assertNotNull(foundShiftsOfDay);
    }

    @Test
    void persistShift() {
        Shift shift = aShift()
                .forShiftsOfDay(persisted(aShiftsOfDay()
                        .forShiftSettings(persisted(aShiftSettings()))))
                .build();

        Shift foundShift = testEntityManager.persistFlushFind(shift);

        assertNotNull(foundShift);
    }

}
