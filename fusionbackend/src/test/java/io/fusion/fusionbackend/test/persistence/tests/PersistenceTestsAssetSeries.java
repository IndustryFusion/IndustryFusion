package io.fusion.fusionbackend.test.persistence.tests;

import io.fusion.fusionbackend.model.*;
import io.fusion.fusionbackend.test.persistence.PersistenceTestsBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static io.fusion.fusionbackend.test.persistence.builder.AssetSeriesBuilder.anAssetSeries;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeBuilder.anAssetType;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeTemplateBuilder.anAssetTypeTemplate;
import static io.fusion.fusionbackend.test.persistence.builder.CompanyBuilder.aCompany;
import static io.fusion.fusionbackend.test.persistence.builder.ConnectivityProtocolBuilder.aConnectivityProtocol;
import static io.fusion.fusionbackend.test.persistence.builder.ConnectivityTypeBuilder.aConnectivityType;
import static org.junit.jupiter.api.Assertions.*;
import static io.fusion.fusionbackend.test.persistence.builder.CountryBuilder.aCountry;
import static io.fusion.fusionbackend.test.persistence.builder.FactorySiteBuilder.aFactorySite;
import static io.fusion.fusionbackend.test.persistence.builder.ShiftBuilder.aShift;
import static io.fusion.fusionbackend.test.persistence.builder.ShiftSettingsBuilder.aShiftSettings;
import static io.fusion.fusionbackend.test.persistence.builder.ShiftsOfDayBuilder.aShiftsOfDay;


public class PersistenceTestsAssetSeries extends PersistenceTestsBase {

    public static final String NEW_STRING_VALUE = "New String Value";
    @Autowired
    private TestEntityManager testEntityManager;

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
