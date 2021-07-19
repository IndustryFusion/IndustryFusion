package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.enums.CompanyType;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static io.fusion.fusionbackend.test.persistence.AssetTypeBuilder.anAssetType;
import static io.fusion.fusionbackend.test.persistence.AssetTypeTemplateBuilder.anAssetTypeTemplate;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class ExamplePersistenceTest {


    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    public void name() {

        AssetTypeTemplate assetTypeTemplate = anAssetTypeTemplate()
                .forType(persisted(anAssetType()))
                .build();
        testEntityManager.persist(assetTypeTemplate);

        Company company = new Company();
        company.setType(CompanyType.ECOSYSTEM_MANAGER);
        testEntityManager.persist(company);

        AssetSeries assetSeries = new AssetSeries();
        assetSeries.setAssetTypeTemplate(assetTypeTemplate);
        assetSeries.setCompany(company);
        company.getAssetSeries().add(assetSeries);
        assetTypeTemplate.getAssetSeries().add(assetSeries);
        testEntityManager.persist(assetSeries);

        Asset asset = new Asset();
        asset.setName("Testasset");
        asset.setAssetSeries(assetSeries);
        assetSeries.getAssets().add(asset);
        asset.setCompany(company);
        testEntityManager.persist(asset);


//        testEntityManager.flush();


        Asset foundAsset = testEntityManager.find(asset.getClass(), asset.getId());
        Assertions.assertNotNull(foundAsset);


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