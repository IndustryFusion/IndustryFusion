package io.fusion.fusionbackend.test.persistence.tests;

import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.enums.PublicationState;
import io.fusion.fusionbackend.test.persistence.PersistenceTestsBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeBuilder.anAssetType;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeTemplateBuilder.anAssetTypeTemplate;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;


public class PersistenceTestsAssetTypeTemplate extends PersistenceTestsBase {

    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    void persistAssetTypeTemplate() {
        AssetTypeTemplate assetTypeTemplate = anAssetTypeTemplate()
                .forType(persisted(anAssetType()))
                .build();

        AssetTypeTemplate foundTemplate = testEntityManager.persistFlushFind(assetTypeTemplate);

        assertNotNull(foundTemplate);
    }

    @Test
    void persistAssetTypeTemplateWithSubsystem() {

        AssetTypeTemplate subsystem = persisted(anAssetTypeTemplate()
                .forType(persisted(anAssetType())))
                .build();

        AssetTypeTemplate parent = persisted(anAssetTypeTemplate()
                .forType(persisted(anAssetType())))
                .build();


        parent.getSubsystems().add(subsystem);

        AssetTypeTemplate foundParent = testEntityManager.persistFlushFind(parent);

        assertEquals(1, foundParent.getSubsystems().size());
    }
}
