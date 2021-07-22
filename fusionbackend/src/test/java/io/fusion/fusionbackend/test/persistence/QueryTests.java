package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.repository.AssetRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Set;

import static io.fusion.fusionbackend.test.persistence.builder.AssetBuilder.anAsset;
import static io.fusion.fusionbackend.test.persistence.builder.AssetSeriesBuilder.anAssetSeries;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeBuilder.anAssetType;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeTemplateBuilder.anAssetTypeTemplate;
import static io.fusion.fusionbackend.test.persistence.builder.CompanyBuilder.aCompany;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class QueryTests extends PersistenceTestsBase{

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

        Asset subsystem = persisted(anAsset()
                .basedOnSeries(persisted(anAssetSeries()
                        .forCompany(company)
                        .basedOnTemplate(persisted(anAssetTypeTemplate()
                                .forType(persisted(anAssetType()))))))
                .forCompany(company)
                .asSubsystemOf(parent))
                .build();


        Set<Asset> subsystemCandidates = assetRepository.findSubsystemCandidates(company.getId());

        assertTrue(parent.getSubsystems().contains(subsystem));
        assertTrue(subsystemCandidates.contains(parent) );
    }


}
