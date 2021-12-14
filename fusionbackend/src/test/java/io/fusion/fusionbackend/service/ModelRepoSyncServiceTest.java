package io.fusion.fusionbackend.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ModelRepoSyncServiceTest {
    @Autowired
    private ModelRepoSyncService modelRepoSyncService;

    @Test
    void testExtract() {
        assertThat(modelRepoSyncService.extractRepoName("git@github.com:IndustryFusion/fusionmodels.git"))
                .isEqualTo("fusionmodels");
    }

    @Test
    void testExtractTwoSlashes() {
        assertThat(modelRepoSyncService.extractRepoName("git@github.com:IndustryFusion/abc/fusionmodels.git"))
                .isEqualTo("fusionmodels");
    }
}