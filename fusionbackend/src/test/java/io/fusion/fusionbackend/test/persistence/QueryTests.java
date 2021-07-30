package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.repository.AssetRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Set;

import static io.fusion.fusionbackend.test.persistence.builder.AssetBuilder.anAsset;
import static io.fusion.fusionbackend.test.persistence.builder.AssetSeriesBuilder.anAssetSeries;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeBuilder.anAssetType;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeTemplateBuilder.anAssetTypeTemplate;
import static io.fusion.fusionbackend.test.persistence.builder.CompanyBuilder.aCompany;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class QueryTests extends PersistenceTestsBase {

    @Autowired
    AssetRepository assetRepository;


    @Test
    void findSubsystemCandidates() {
        Company company = persisted(aCompany()).build();

        Asset parent = persisted(anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(company)
                        .basedOnTemplate(persisted(anAssetTypeTemplate()
                                .forType(persisted(anAssetType()))))))
                .forCompany(company))
                .build();

        Asset subsystemCandidate = persisted(anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(company)
                        .basedOnTemplate(persisted(anAssetTypeTemplate()
                                .forType(persisted(anAssetType()))))))
                .forCompany(company))
                .build();


        Set<Asset> subsystemCandidates = assetRepository.findSubsystemCandidates(parent.getAssetSeries().getId(), company.getId());

        assertTrue(subsystemCandidates.contains(subsystemCandidate));
    }

    @Test
    void findSubsystemCandidates_subsystemsShouldNotBeFound() {
        Company company = persisted(aCompany()).build();

        Asset parent = persisted(anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(company)
                        .basedOnTemplate(persisted(anAssetTypeTemplate()
                                .forType(persisted(anAssetType()))))))
                .forCompany(company))
                .build();

        Asset subsystem = persisted(anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(company)
                        .basedOnTemplate(persisted(anAssetTypeTemplate()
                                .forType(persisted(anAssetType()))))))
                .forCompany(company)
                .asSubsystemOf(parent))
                .build();


        Set<Asset> subsystemCandidates = assetRepository.findSubsystemCandidates(parent.getAssetSeries().getId(), company.getId());

        assertTrue(parent.getSubsystems().contains(subsystem));
        assertTrue(subsystemCandidates.isEmpty());
    }

    @Test
    void findSubsystemCandidates_forDifferentAssetSeries() {
        Company company = persisted(aCompany()).build();

        AssetSeries parentAssetSeries = persisted(anAssetSeries()
                .forCompany(company)
                .basedOnTemplate(persisted(anAssetTypeTemplate()
                        .forType(persisted(anAssetType()))))).build();

        Asset parent = persisted(anAsset()
                .basedOnSeries(parentAssetSeries)
                .forCompany(company))
                .build();

        Asset assetOfSameAssetSeries = persisted(anAsset()
                .basedOnSeries(parentAssetSeries)
                .forCompany(company))
                .build();

        Asset assetOfOtherAssetSeries = persisted(anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(company)
                        .basedOnTemplate(persisted(anAssetTypeTemplate()
                                .forType(persisted(anAssetType()))))))
                .forCompany(company))
                .build();


        Set<Asset> subsystemCandidates = assetRepository.findSubsystemCandidates(parent.getAssetSeries().getId(), company.getId());

        assertTrue(subsystemCandidates.contains(assetOfOtherAssetSeries));
        assertFalse(subsystemCandidates.contains(assetOfSameAssetSeries));
    }

}
