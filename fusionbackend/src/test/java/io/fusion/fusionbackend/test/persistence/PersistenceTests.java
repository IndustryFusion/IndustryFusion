package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.test.persistence.builder.Builder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static io.fusion.fusionbackend.test.persistence.builder.AssetBuilder.anAsset;
import static io.fusion.fusionbackend.test.persistence.builder.AssetSeriesBuilder.anAssetSeries;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeBuilder.anAssetType;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeTemplateBuilder.anAssetTypeTemplate;
import static io.fusion.fusionbackend.test.persistence.builder.CompanyBuilder.aCompany;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class PersistenceTests {


    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    void persistCompany() {
        Company company = aCompany().build();

        Company foundCompany = testEntityManager.persistAndFlush(company);

        assertNotNull(foundCompany);
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

    // TODO 19.07.2021: Should be extracted to be used in different TestClasses
    private <T> Builder<T> persisted(final Builder<T> builder) {
        return () -> {
            T entity = builder.build();
            testEntityManager.persist(entity);
            return entity;
        };
    }
}