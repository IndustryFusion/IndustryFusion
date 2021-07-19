package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static io.fusion.fusionbackend.test.persistence.AssetSeriesBuilder.anAssetSeries;
import static io.fusion.fusionbackend.test.persistence.AssetTypeBuilder.anAssetType;
import static io.fusion.fusionbackend.test.persistence.AssetTypeTemplateBuilder.anAssetTypeTemplate;
import static io.fusion.fusionbackend.test.persistence.CompanyBuilder.aCompany;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class ExamplePersistenceTest {


    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    public void name() {

        Builder<Company> company = persisted(aCompany());

        AssetSeries assetSeries = persisted(anAssetSeries()
                .forCompany(company)
                .basedOnTemplate(persisted(anAssetTypeTemplate()
                        .forType(persisted(anAssetType())))))
                .build();

        Asset asset = new Asset();
        asset.setName("Testasset");
        asset.setAssetSeries(assetSeries);
        assetSeries.getAssets().add(asset);
        asset.setCompany(company.build());
        testEntityManager.persistAndFlush(asset);

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