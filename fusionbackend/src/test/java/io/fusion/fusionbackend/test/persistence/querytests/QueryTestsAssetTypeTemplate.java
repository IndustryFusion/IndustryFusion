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
    void findSubsystemCandidates_peersShouldNotBeFound() {
        AssetType parentAssetType = persisted(anAssetType()).build();

        AssetTypeTemplate parent = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(parentAssetType))
                .build();

        AssetTypeTemplate subsystemCandidate = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        AssetTypeTemplate peer = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        parent.getPeers().add(peer);

        Set<AssetTypeTemplate> subsystemCandidates = assetTypeTemplateRepository
                .findSubsystemCandidates(parentAssetType.getId(), parent.getId());

        assertTrue(subsystemCandidates.contains(subsystemCandidate));
        assertFalse(subsystemCandidates.contains(peer));
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
    void findSubsystemCandidates_unpublishedAssetTypeTemplatesShouldNotBeFound() {
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

    @Test
    void findSubsystemCandidates_sameAssetTypeTemplateShouldNotBeFound() {
        AssetType parentAssetType = persisted(anAssetType()).build();

        AssetTypeTemplate parent = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(parentAssetType))
                .build();

        Set<AssetTypeTemplate> subsystemCandidates = assetTypeTemplateRepository
                .findSubsystemCandidates(parentAssetType.getId(), parent.getId());

        assertTrue(subsystemCandidates.isEmpty());
    }


    @Test
    void findPeerCandidates() {
        AssetTypeTemplate parent = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        AssetTypeTemplate peerCandidate = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        Set<AssetTypeTemplate> peerCandidates = assetTypeTemplateRepository
                .findPeerCandidates(parent.getId());

        assertTrue(peerCandidates.contains(peerCandidate));
    }

    @Test
    void findPeerCandidates_subsystemsShouldNotBeFound() {
        AssetTypeTemplate parent = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        AssetTypeTemplate subsystem = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType()))
                .asSubsystemOf(parent))
                .build();

        Set<AssetTypeTemplate> peerCandidates = assetTypeTemplateRepository
                .findPeerCandidates(parent.getId());

        assertTrue(parent.getSubsystems().contains(subsystem));
        assertTrue(peerCandidates.isEmpty());
    }

    @Test
    void findPeerCandidates_unpublishedAssetTypeTemplatesShouldNotBeFound() {
        AssetTypeTemplate parent = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        AssetTypeTemplate unpublishedPeer = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.DRAFT)
                .forType(persisted(anAssetType())))
                .build();

        Set<AssetTypeTemplate> peerCandidates = assetTypeTemplateRepository
                .findPeerCandidates(parent.getId());

        assertEquals(2, assetTypeTemplateRepository.findAll(AssetTypeTemplateRepository.DEFAULT_SORT).size());
        assertTrue(peerCandidates.isEmpty());
        assertEquals(PublicationState.DRAFT, unpublishedPeer.getPublicationState());
    }

    @Test
    void findPeerCandidates_sameAssetTypeTemplateShouldNotBeFound() {
        AssetTypeTemplate parent = persisted(anAssetTypeTemplate()
                .withPublicationState(PublicationState.PUBLISHED)
                .forType(persisted(anAssetType())))
                .build();

        Set<AssetTypeTemplate> peerCandidates = assetTypeTemplateRepository
                .findPeerCandidates(parent.getId());

        assertTrue(peerCandidates.isEmpty());
    }
}
