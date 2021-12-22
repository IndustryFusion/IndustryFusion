/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package io.fusion.fusionbackend.service.export;

import io.fusion.fusionbackend.dto.SyncResultDto;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.service.AssetSeriesService;
import io.fusion.fusionbackend.service.AssetService;
import io.fusion.fusionbackend.service.ModelRepoSyncService;
import io.fusion.fusionbackend.service.ontology.OntologyBuilder;
import io.fusion.fusionbackend.service.ontology.OntologyUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.ontology.OntModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
@Transactional
@Slf4j
public class FleetManagerImportExportService extends BaseZipImportExport {
    private final AssetSeriesService assetSeriesService;
    private final AssetService assetService;

    private final EcosystemManagerImportExportService ecosystemManagerImportExportService;
    private final AssetYamlExportService assetYamlExportService;
    private final ModelRepoSyncService modelRepoSyncService;
    private final OntologyBuilder ontologyBuilder;

    public static final String FILENAME_ASSET_SERIES = "AssetSeries";
    public static final String FILENAME_ASSETS = "Assets";
    public static final String FILENAME_ASSET = "Asset";
    public static final String FILENAME_NGSI_LD = "NGSI-LD";
    public static final String FILENAME_OWL = "Owl";
    public static final String FILENAME_APPLICATION_YAML = "application";
    private static final String FLEETMAN_SUBDIR = "machinemanufacturer";

    @Autowired
    public FleetManagerImportExportService(AssetSeriesService assetSeriesService,
                                           AssetService assetService,
                                           EcosystemManagerImportExportService ecosystemManagerImportExportService,
                                           AssetYamlExportService assetYamlExportService,
                                           ModelRepoSyncService modelRepoSyncService,
                                           OntologyBuilder ontologyBuilder) {
        this.assetSeriesService = assetSeriesService;
        this.assetService = assetService;
        this.ecosystemManagerImportExportService = ecosystemManagerImportExportService;
        this.assetYamlExportService = assetYamlExportService;
        this.modelRepoSyncService = modelRepoSyncService;
        this.ontologyBuilder = ontologyBuilder;
    }

    public void exportEntitiesToStreamAsZip(final Long companyId,
                                            final OutputStream responseOutputStream) throws IOException {

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {

            // Order is crucial
            ecosystemManagerImportExportService.writeEntitiesToZipOutputStream(zipOutputStream);

            addFileToZipOutputStream(zipOutputStream, getContentFileName(FILENAME_ASSET_SERIES),
                    assetSeriesService.exportAllToJson(companyId));

            addFileToZipOutputStream(zipOutputStream, getContentFileName(FILENAME_ASSETS),
                    assetService.exportAllFleetAssetsToJson(companyId));

        } catch (IOException ioe) {
            ioe.printStackTrace();
            throw new IOException(ioe.getMessage());
        }

        responseOutputStream.write(byteArrayOutputStream.toByteArray());
        responseOutputStream.close();
    }

    public SyncResultDto syncWithModelRepo(final Long companyId) {
        if (modelRepoSyncService.pullRepo()) {
            exportAssetSeries(companyId);
            return modelRepoSyncService.checkChangesAndSync();
        }
        return SyncResultDto.builder().build();
    }

    @Override
    public void importEntitiesFromZip(final Long companyId,
                                      final Long factorySiteId,
                                      final InputStream inputStream) throws IOException {
        super.importEntitiesFromZip(companyId, factorySiteId, inputStream);
    }

    @Override
    protected ImportResult importZipEntry(final ZipEntry entry,
                                          final ZipInputStream zipInputStream,
                                          final Long companyId,
                                          final Long factorySiteId) throws IOException {
        ImportResult importResult = ecosystemManagerImportExportService.tryImportOfZipEntry(entry, zipInputStream,
                ImportResult.empty());

        if (!importResult.isEntryImported) {
            importResult = tryImportOfZipEntry(entry, zipInputStream, companyId, factorySiteId, importResult);
            if (!importResult.isEntryImported) {
                throw new UnsupportedOperationException("File can not be imported, filename unknown.");
            }
        }

        return importResult;
    }

    public ImportResult tryImportOfZipEntry(final ZipEntry entry,
                                            final ZipInputStream zipInputStream,
                                            final Long companyId,
                                            final Long factorySiteId,
                                            final ImportResult prevImportResult) throws IOException {
        boolean isEntryImported = entry != null && zipInputStream != null;
        int totalEntitySkippedCount = prevImportResult.totalEntitySkippedCount;
        if (isEntryImported) {
            switch (entry.getName()) {
                case FILENAME_ASSET_SERIES + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += assetSeriesService
                            .importMultipleFromJson(readZipEntry(entry, zipInputStream), companyId);
                    break;
                case FILENAME_ASSETS + CONTENT_FILE_EXTENSION:
                case FILENAME_ASSET + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += assetService.importMultipleFromJsonToFactoryManager(
                            readZipEntry(entry, zipInputStream),
                            companyId, factorySiteId
                    );
                    break;

                default:
                    isEntryImported = false;
            }
        }

        return new ImportResult(isEntryImported, totalEntitySkippedCount);
    }

    public void generateAssetOnboardingZipPackage(final Long companyId,
                                                  final Long assetSeriesId,
                                                  final Long assetId,
                                                  final OutputStream responseOutputStream) throws IOException {

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {

            addFileToZipOutputStream(zipOutputStream, getContentFileName(FILENAME_ASSET),
                    assetService.exportFleetAssetsToJson(companyId, assetId));

            String assetNgsiLd = assetService.getAssetByIdAsNgsiLD(assetId);
            addFileToZipOutputStream(zipOutputStream, getContentFileName(FILENAME_NGSI_LD),
                    assetNgsiLd.getBytes(StandardCharsets.UTF_8));

            OntModel assetOntModel = assetSeriesService.getAssetSeriesRdf(assetSeriesId, companyId);
            addFileToZipOutputStream(zipOutputStream, getModelFileName(FILENAME_OWL),
                    OntologyUtil.exportOwlOntologyModelToJsonUsingJena(assetOntModel));

            addFileToZipOutputStream(zipOutputStream, getConfigFileName(FILENAME_APPLICATION_YAML),
                     assetYamlExportService.createYamlFile(assetService.getAssetById(assetId)));

        } catch (IOException ioe) {
            ioe.printStackTrace();
            throw new IOException(ioe.getMessage());
        }

        responseOutputStream.write(byteArrayOutputStream.toByteArray());
        responseOutputStream.close();
    }

    private void exportAssetSeries(final Long companyId) {
        Set<AssetSeries> assetSeriesSet = assetSeriesService.getAssetSeriesSetByCompany(companyId);
        long modelExportCount = assetSeriesSet.stream().filter(this::writeAsModelToGitDir).count();
        log.info("Wrote {} from {} AS models", modelExportCount, assetSeriesSet.size());
        long contentExportCount = assetSeriesSet.stream().filter(this::writeAsContentToGitDir).count();
        log.info("Wrote {} from {} AS jsons", contentExportCount, assetSeriesSet.size());
    }

    private Boolean writeAsModelToGitDir(final AssetSeries assetSeries) {
        OntModel ontModel = ontologyBuilder.buildAssetSeriesOntology(assetSeries);
        Path filepath = getAsFilePath(assetSeries, MODEL_FILE_EXTENSION);
        try {
            return OntologyUtil.writeOntologyModelToFile(ontModel, filepath.toFile(), false);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private Boolean writeAsContentToGitDir(final AssetSeries assetSeries) {
        Path filepath = getAsFilePath(assetSeries, CONTENT_FILE_EXTENSION);
        try {
            return assetSeriesService.exportAssetSeriesToJsonFile(assetSeries, filepath.toFile(), false);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private Path getAsFilePath(final AssetSeries assetSeries, final String extension) {
        Path filepath = modelRepoSyncService.getLocalGitPath()
                .resolve(FLEETMAN_SUBDIR)
                .resolve(Long.toString(assetSeries.getCompany().getId()));
        final String filename = assetSeries.getGlobalId() + extension;
        return filepath.resolve(FLEETMAN_SUBDIR).resolve(filename);
    }
}