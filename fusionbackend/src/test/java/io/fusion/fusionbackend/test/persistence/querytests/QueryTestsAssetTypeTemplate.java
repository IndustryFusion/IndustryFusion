package io.fusion.fusionbackend.test.persistence.querytests;

import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.enums.PublicationState;
import io.fusion.fusionbackend.repository.AssetTypeTemplateRepository;
import io.fusion.fusionbackend.test.persistence.PersistenceTestsBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Set;

import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeBuilder.anAssetType;
import static io.fusion.fusionbackend.test.persistence.builder.AssetTypeTemplateBuilder.anAssetTypeTemplate;
import static org.junit.jupiter.api.Assertions.*;

public class QueryTestsAssetTypeTemplate extends PersistenceTestsBase {

    @Autowired
    AssetTypeTemplateRepository assetTypeTemplateRepository;


    @Test
    void findSubsystemCandidates() {

        AssetTypeTemplate parent = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        AssetTypeTemplate subsystemCandidate = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        Set<AssetTypeTemplate> subsystemCandidates = assetTypeTemplateRepository
                .findSubsystemCandidates(parent.getAssetType().getId(), parent.getId());

        assertTrue(subsystemCandidates.contains(subsystemCandidate));
    }

    @Test
    void findSubsystemCandidates_builtInSubsystemsShouldNotBeFound() {

        AssetTypeTemplate parent = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        AssetTypeTemplate subsystem = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType()))
                .asSubsystemOf(parent))
                .build();

        Set<AssetTypeTemplate> subsystemCandidates = assetTypeTemplateRepository
                .findSubsystemCandidates(parent.getAssetType().getId(), parent.getId());

        assertTrue(parent.getSubsystems().contains(subsystem));
        assertTrue(subsystemCandidates.isEmpty());
    }

    @Test
    void findSubsystemCandidates_unpublishedSubsystemsShouldNotBeFound() {

        AssetTypeTemplate parent = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        AssetTypeTemplate unpublishedSubsystem = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.DRAFT)
                .forType(persisted(anAssetType())))
                .build();

        Set<AssetTypeTemplate> subsystemCandidates = assetTypeTemplateRepository
                .findSubsystemCandidates(parent.getAssetType().getId(), parent.getId());

        assertEquals(2, assetTypeTemplateRepository.findAll(AssetTypeTemplateRepository.DEFAULT_SORT).size());
        assertTrue(subsystemCandidates.isEmpty());
        assertEquals(PublicationState.DRAFT, unpublishedSubsystem.getPublicationState());
    }

    @Test
    void findSubsystemCandidates_forDifferentAssetType() {

        AssetType parentAssetType = persisted(anAssetType()).build();

        AssetTypeTemplate parent = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(parentAssetType))
                .build();

        AssetTypeTemplate assetTypeTemplateOfSameAssetType = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(parentAssetType))
                .build();

        AssetTypeTemplate assetTypeTemplateOfOtherAssetType = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        Set<AssetTypeTemplate> subsystemCandidates = assetTypeTemplateRepository
                .findSubsystemCandidates(parent.getAssetType().getId(), parent.getId());

        assertTrue(subsystemCandidates.contains(assetTypeTemplateOfOtherAssetType));
        assertFalse(subsystemCandidates.contains(assetTypeTemplateOfSameAssetType));
    }
}
