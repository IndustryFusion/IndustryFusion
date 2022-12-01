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

import io.fusion.fusionbackend.config.ShaclConfig;
import io.fusion.fusionbackend.dto.ProcessingResultDto;
import io.fusion.fusionbackend.dto.SyncResultDto;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.shacl.ShaclShape;
import io.fusion.fusionbackend.service.AssetSeriesService;
import io.fusion.fusionbackend.service.AssetService;
import io.fusion.fusionbackend.service.ModelRepoSyncService;
import io.fusion.fusionbackend.service.ngsilj.NgsiLdBuilder;
import io.fusion.fusionbackend.service.ontology.OntologyBuilder;
import io.fusion.fusionbackend.service.ontology.OntologyUtil;
import io.fusion.fusionbackend.service.shacl.ShaclFactory;
import io.fusion.fusionbackend.service.shacl.ShaclMapper;
import io.fusion.fusionbackend.service.shacl.ShaclPrefixes;
import io.fusion.fusionbackend.service.shacl.ShaclWriter;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.riot.RDFDataMgr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
@Transactional
@Slf4j
public class FleetManagerImportExportService extends BaseZipImportExport {
    public static final String FILENAME_ASSET_SERIES = "AssetSeries";
    public static final String FILENAME_ASSETS = "Assets";
    public static final String FILENAME_ASSET = "Asset";
    public static final String FILENAME_NGSI_LD = "NGSI-LD";
    public static final String FILENAME_OWL = "Owl";
    public static final String FILENAME_APPLICATION_YAML = "application";
    private static final String FLEET_MANAGER_SUBDIR = "machinemanufacturer";
    private final AssetSeriesService assetSeriesService;
    private final AssetService assetService;
    private final EcosystemManagerImportExportService ecosystemManagerImportExportService;
    private final AssetYamlExportService assetYamlExportService;
    private final ModelRepoSyncService modelRepoSyncService;
    private final OntologyBuilder ontologyBuilder;
    private final ShaclFactory shaclFactory;
    private final ShaclMapper shaclMapper;
    private final ShaclConfig shaclConfig;
    private final NgsiLdBuilder ngsiLdBuilder;

    @Autowired
    public FleetManagerImportExportService(AssetSeriesService assetSeriesService,
                                           AssetService assetService,
                                           EcosystemManagerImportExportService ecosystemManagerImportExportService,
                                           AssetYamlExportService assetYamlExportService,
                                           ModelRepoSyncService modelRepoSyncService,
                                           OntologyBuilder ontologyBuilder,
                                           ShaclMapper shaclMapper,
                                           ShaclFactory shaclFactory,
                                           ShaclConfig shaclConfig,
                                           NgsiLdBuilder ngsiLdBuilder
    ) {
        this.assetSeriesService = assetSeriesService;
        this.assetService = assetService;
        this.ecosystemManagerImportExportService = ecosystemManagerImportExportService;
        this.assetYamlExportService = assetYamlExportService;
        this.modelRepoSyncService = modelRepoSyncService;
        this.ontologyBuilder = ontologyBuilder;
        this.shaclFactory = shaclFactory;
        this.shaclMapper = shaclMapper;
        this.shaclConfig = shaclConfig;
        this.ngsiLdBuilder = ngsiLdBuilder;
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
            SyncResultDto result = new SyncResultDto();
            result.getImportResult().add(importAssetSeries(companyId));
            result.setExportResult(exportAssetSeries(companyId));
            result.getExportResult().setHandled(modelRepoSyncService.checkChangesAndSync());
            return result;
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

        if (!importResult.isEntryImported()) {
            importResult = tryImportOfZipEntry(entry, zipInputStream, companyId, factorySiteId, importResult);
            if (!importResult.isEntryImported()) {
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
        int totalEntitySkippedCount = prevImportResult.getTotalEntitySkippedCount();
        if (isEntryImported) {
            switch (entry.getName()) {
                case FILENAME_ASSET_SERIES + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += assetSeriesService
                            .importMultipleFromJson(readZipEntry(entry, zipInputStream), companyId)
                            .getSkipped();
                    break;
                case FILENAME_ASSETS + CONTENT_FILE_EXTENSION:
                case FILENAME_ASSET + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += assetService.importMultipleFromJsonToFactoryManager(
                            readZipEntry(entry, zipInputStream),
                            companyId, factorySiteId)
                            .getSkipped();
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

    private ProcessingResultDto exportAssetSeries(final Long companyId) {
        final ProcessingResultDto result = new ProcessingResultDto();
        Set<AssetSeries> assetSeriesSet = assetSeriesService.getAssetSeriesSetByCompany(companyId);
        long modelExportCount = assetSeriesSet.stream().filter(this::writeAsModelToGitDir).count();
        log.info("Wrote {} from {} AS models", modelExportCount, assetSeriesSet.size());
        long contentExportCount = assetSeriesSet.stream().filter(this::writeAsContentToGitDir).count();
        log.info("Wrote {} from {} AS jsons", contentExportCount, assetSeriesSet.size());

        result.setHandled(modelExportCount + contentExportCount);
        result.setSkipped(assetSeriesSet.size() * 2L - modelExportCount - contentExportCount);

        return result;
    }

    private ProcessingResultDto importAssetSeries(final Long companyId) {
        Path companyAsFilePath = getAsDirPath(companyId);
        try (Stream<Path> fileStream = Files.list(companyAsFilePath)) {
            List<Path> files = fileStream
                    .filter(path -> !Files.isDirectory(path)
                            && path.toFile().getName().endsWith(".json")).collect(Collectors.toList());
            final ProcessingResultDto result = files.stream()
                    .map(path -> importFile(path.toFile(), companyId))
                    .reduce(ProcessingResultDto.builder().build(), ProcessingResultDto::add);
            log.info("Imported {} and skipped {} entities from {} AS jsons in {}", result.getHandled(),
                    result.getSkipped(), files.size(), companyAsFilePath);
            return result;
        } catch (IOException e) {
            log.warn("Import error: reading files from {}", companyAsFilePath, e);
            return ProcessingResultDto.builder().build();
        }
    }

    private boolean writeAsModelToGitDir(final AssetSeries assetSeries) {
        OntModel ontModel = ontologyBuilder.buildAssetSeriesOntology(assetSeries);
        Path filepath = getAsFilePath(assetSeries, MODEL_FILE_EXTENSION);
        try {
            return OntologyUtil.writeOntologyModelToFile(ontModel, filepath.toFile(), false);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private boolean writeAsContentToGitDir(final AssetSeries assetSeries) {
        Path filepath = getAsFilePath(assetSeries, CONTENT_FILE_EXTENSION);
        try {
            return assetSeriesService.exportAssetSeriesToJsonFile(assetSeries, filepath.toFile(), false);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private ProcessingResultDto importFile(File file, final Long companyId) {
        try {
            return assetSeriesService.importSingleFromJsonFile(file, companyId);
        } catch (IOException e) {
            log.warn(ERROR_READING_FILE, file, e);
            return ProcessingResultDto.builder().build();
        }
    }

    private Path getAsFilePath(final AssetSeries assetSeries, final String extension) {
        Path filepath = getAsDirPath(assetSeries.getCompany().getId());
        final String filename = URLEncoder.encode(assetSeries.getGlobalId(), StandardCharsets.UTF_8) + extension;
        return filepath.resolve(filename);
    }

    private Path getAsDirPath(final Long companyId) {
        return modelRepoSyncService.getLocalGitPath()
                .resolve(FLEET_MANAGER_SUBDIR)
                .resolve(Long.toString(companyId));
    }

    public ProcessingResultDto importEntitiesFromShacl(MultipartFile file, Long companyId) throws IOException {
        ProcessingResultDto result = new ProcessingResultDto();
        Set<AssetSeries> existingAssetSeries = assetSeriesService.getAssetSeriesSetByCompany(companyId);
        Path tempFile = Files.write(Files.createTempFile(null, ".ttl"),
                file.getInputStream().readAllBytes());
        try {
            shaclFactory.graphTriplesToShaclShapes(
                    RDFDataMgr.loadModel(tempFile.toAbsolutePath().toString())
                            .getGraph())
                    .stream()
                    .map(shape -> shaclMapper.mapToAssetSeries(shape, companyId))
                    .forEach(assetSeries -> {
                        if (existingAssetSeries.stream()
                                .anyMatch(candidate -> isEqualAssetSeries(assetSeries, candidate))) {
                            result.incSkipped();
                        } else {
                            changeSeriesNameIfPresent(assetSeries, existingAssetSeries);
                            assetSeriesService.createAssetSeries(
                                    companyId,
                                    assetSeries.getAssetTypeTemplate().getId(),
                                    assetSeries.getConnectivitySettings().getConnectivityType().getId(),
                                    assetSeries.getConnectivitySettings().getConnectivityProtocol().getId(),
                                    assetSeries
                            );
                            result.incHandled();
                        }
                    });
        } finally {
            Files.delete(tempFile);
        }
        return result;
    }

    private void changeSeriesNameIfPresent(AssetSeries assetSeries, Set<AssetSeries> existingAssetSeries) {
        Set<String> names = existingAssetSeries.stream().map(AssetSeries::getName).collect(Collectors.toSet());
        if (names.contains(assetSeries.getName())) {
            int id = 1;
            while (names.contains(assetSeries.getName() + " " + id)) {
                id++;
            }
            assetSeries.setName(assetSeries.getName() + " " + id);
        }
    }

    private boolean isEqualAssetSeries(AssetSeries a, AssetSeries b) {
        return a.getCompany().equals(b.getCompany())
                && a.getAssetTypeTemplate().getId().equals(b.getAssetTypeTemplate().getId())
                && a.getName().equals(b.getName())
                && a.getDescription().equals(b.getDescription());
    }
}