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

import io.fusion.fusionbackend.dto.ProcessingResultDto;
import io.fusion.fusionbackend.dto.SyncResultDto;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.service.AssetTypeService;
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
import io.fusion.fusionbackend.service.FieldService;
import io.fusion.fusionbackend.service.ModelRepoSyncService;
import io.fusion.fusionbackend.service.UnitService;
import io.fusion.fusionbackend.service.ontology.OntologyBuilder;
import io.fusion.fusionbackend.service.ontology.OntologyUtil;
import io.fusion.fusionbackend.service.shacl.ShaclBuilder;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.ontology.OntModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
public class EcosystemManagerImportExportService extends BaseZipImportExport {
    private static final String FILENAME_UNITS = "Units";
    private static final String FILENAME_FIELDS = "Fields";
    private static final String FILENAME_ASSET_TYPES = "AssetTypes";
    private static final String FILENAME_ASSET_TYPE_TEMPLATES = "PublishedAssetTypeTemplates";
    private static final String ECOSYSTEM_MANAGER_SUBDIR = "ecosystem";
    private static final String ATT_SUBDIR = "att";
    private final UnitService unitService;
    private final FieldService fieldService;
    private final AssetTypeService assetTypeService;
    private final AssetTypeTemplateService assetTypeTemplateService;
    private final ModelRepoSyncService modelRepoSyncService;
    private final OntologyBuilder ontologyBuilder;
    private final ShaclBuilder shaclBuilder;

    @Autowired
    public EcosystemManagerImportExportService(UnitService unitService,
                                               FieldService fieldService,
                                               AssetTypeService assetTypeService,
                                               AssetTypeTemplateService assetTypeTemplateService,
                                               ModelRepoSyncService modelRepoSyncService,
                                               OntologyBuilder ontologyBuilder,
                                               ShaclBuilder shaclBuilder) {
        this.unitService = unitService;
        this.fieldService = fieldService;
        this.assetTypeService = assetTypeService;
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.modelRepoSyncService = modelRepoSyncService;
        this.ontologyBuilder = ontologyBuilder;
        this.shaclBuilder = shaclBuilder;
    }

    public void exportEntitiesToStreamAsZip(final OutputStream responseOutputStream) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {
            writeEntitiesToZipOutputStream(zipOutputStream);
        } catch (IOException ioe) {
            ioe.printStackTrace();
            throw new IOException(ioe.getMessage());
        }

        responseOutputStream.write(byteArrayOutputStream.toByteArray());
        responseOutputStream.close();
    }

    public void writeEntitiesToZipOutputStream(ZipOutputStream zipOutputStream) throws IOException {
        // Order is crucial
        addFileToZipOutputStream(zipOutputStream,
                getContentFileName(FILENAME_UNITS), unitService.exportAllToJson());
        addFileToZipOutputStream(zipOutputStream,
                getContentFileName(FILENAME_FIELDS), fieldService.exportAllToJson());
        addFileToZipOutputStream(zipOutputStream,
                getContentFileName(FILENAME_ASSET_TYPES), assetTypeService.exportAllToJson());
        addFileToZipOutputStream(zipOutputStream,
                getContentFileName(FILENAME_ASSET_TYPE_TEMPLATES), assetTypeTemplateService.exportAllToJson());
    }

    public void importEntitiesFromZip(final InputStream inputStream) throws IOException {
        super.importEntitiesFromZip(null, null, inputStream);
    }

    @Override
    protected ImportResult importZipEntry(final ZipEntry entry,
                                          final ZipInputStream zipInputStream,
                                          final Long companyIdIgnored,
                                          final Long factorySiteIdIgnored) throws IOException {

        ImportResult importResult = tryImportOfZipEntry(entry, zipInputStream, ImportResult.empty());
        if (!importResult.isEntryImported()
                && !entry.getName().equals(getContentFileName(FleetManagerImportExportService.FILENAME_ASSET_SERIES))
                && !entry.getName().equals(getContentFileName(FleetManagerImportExportService.FILENAME_ASSETS))
                && !entry.getName().equals(getContentFileName(FleetManagerImportExportService.FILENAME_ASSET))) {
            throw new UnsupportedOperationException("File can not be imported, filename unknown.");
        }

        return importResult;
    }

    public ImportResult tryImportOfZipEntry(final ZipEntry entry,
                                            final ZipInputStream zipInputStream,
                                            final ImportResult prevImportResult) throws IOException {
        boolean isEntryImported = entry != null;
        int totalEntitySkippedCount = prevImportResult.getTotalEntitySkippedCount();
        if (isEntryImported) {
            switch (entry.getName()) {
                case FILENAME_UNITS + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += unitService.importMultipleFromJson(readZipEntry(entry, zipInputStream))
                            .getSkipped();
                    break;
                case FILENAME_FIELDS + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += fieldService.importMultipleFromJson(readZipEntry(entry, zipInputStream))
                            .getSkipped();
                    break;
                case FILENAME_ASSET_TYPES + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += assetTypeService
                            .importMultipleFromJson(readZipEntry(entry, zipInputStream))
                            .getSkipped();
                    break;
                case FILENAME_ASSET_TYPE_TEMPLATES + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += assetTypeTemplateService
                            .importMultipleFromJson(readZipEntry(entry, zipInputStream))
                            .getSkipped();
                    break;

                default:
                    isEntryImported = false;
            }
        }

        return new ImportResult(isEntryImported, totalEntitySkippedCount);
    }

    public ProcessingResultDto tryImportOfFile(final File file) throws IOException {
        switch (file.getName()) {
            case FILENAME_UNITS + CONTENT_FILE_EXTENSION:
                return unitService.importMultipleFromJsonFile(file);
            case FILENAME_FIELDS + CONTENT_FILE_EXTENSION:
                return fieldService.importMultipleFromJsonFile(file);
            case FILENAME_ASSET_TYPES + CONTENT_FILE_EXTENSION:
                return assetTypeService.importMultipleFromJsonFile(file);
            default:
                if (!file.getName().endsWith(CONTENT_FILE_EXTENSION)) {
                    return ProcessingResultDto.builder().build();
                }
                return assetTypeTemplateService.importSingleFromJsonFile(file);
        }
    }

    public void exportOntologyModelToStream(final OutputStream outputStream) throws IOException {
        OntModel model = ontologyBuilder.buildEcosystemOntology();
        OntologyUtil.writeOwlOntologyModelToStreamUsingJena(model, outputStream);
    }

    public void exportAssetTypeTemplatePackage(OutputStream outputStream, Long id) throws IOException {
        shaclBuilder.buildAssetTypeTemplatePackage(outputStream,
                assetTypeTemplateService.getAssetTypeTemplate(id, true)
        );
    }

    public SyncResultDto syncWithModelRepo() {
        if (modelRepoSyncService.pullRepo()) {
            SyncResultDto result = new SyncResultDto();
            result.getImportResult().add(importAttFiles());
            result.getImportResult().add(importOtherFiles());
            result.setExportResult(exportAssetTypeTemplates());
            result.getExportResult().setHandled(modelRepoSyncService.checkChangesAndSync());
            return result;
        }
        return SyncResultDto.builder().build();
    }

    private ProcessingResultDto exportAssetTypeTemplates() {
        final ProcessingResultDto result = new ProcessingResultDto();
        Set<AssetTypeTemplate> publishedAssetTypeTemplates =
                assetTypeTemplateService.getPublishedAssetTypeTemplates();
        long modelExportCount =
                publishedAssetTypeTemplates.stream().filter(this::writeAttModelToGitDir).count();
        log.info("Wrote {} from {} ATT models", modelExportCount, publishedAssetTypeTemplates.size());
        long contentExportCount =
                publishedAssetTypeTemplates.stream().filter(this::writeAttContentToGitDir).count();
        log.info("Wrote {} from {} ATT jsons", contentExportCount, publishedAssetTypeTemplates.size());

        result.setHandled(modelExportCount + contentExportCount);
        result.setSkipped(publishedAssetTypeTemplates.size() * 2L - modelExportCount - contentExportCount);

        if (writeUnitsContentToGitDir()) {
            log.info("Wrote units json");
            result.incHandled();
        } else {
            result.incSkipped();
        }

        if (writeFieldsContentToGitDir()) {
            log.info("Wrote fields json");
            result.incHandled();
        } else {
            result.incSkipped();
        }

        if (writeAssetTypesContentToGitDir()) {
            log.info("Wrote assettypes json");
            result.incHandled();
        } else {
            result.incSkipped();
        }
        return result;
    }

    private ProcessingResultDto importOtherFiles() {
        return importEcosystemManagerFiles(getEcosystemManagerDirPath());
    }

    private ProcessingResultDto importAttFiles() {
        return importEcosystemManagerFiles(getAttDirPath());
    }

    private ProcessingResultDto importEcosystemManagerFiles(final Path dirPath) {
        try (Stream<Path> fileStream = Files.list(dirPath)) {
            List<Path> files = fileStream
                    .filter(path -> !Files.isDirectory(path)).collect(Collectors.toList());
            final ProcessingResultDto result = files.stream()
                    .map(path -> importFile(path.toFile()))
                    .reduce(ProcessingResultDto.builder().build(), ProcessingResultDto::add);
            log.info("Imported {} and skipped {} entities from {} jsons in {}", result.getHandled(),
                    result.getSkipped(), files.size(), dirPath);
            return result;
        } catch (IOException e) {
            log.warn("Import error: reading files from {}", dirPath, e);
            return ProcessingResultDto.builder().build();
        }

    }

    private boolean writeAttModelToGitDir(final AssetTypeTemplate assetTypeTemplate) {
        OntModel ontModel = ontologyBuilder.buildAssetTypeTemplateOntology(assetTypeTemplate);
        final Path filepath = getAttFilePath(assetTypeTemplate, MODEL_FILE_EXTENSION);
        try {
            return OntologyUtil.writeOntologyModelToFile(ontModel, filepath.toFile(), false);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private boolean writeAttContentToGitDir(final AssetTypeTemplate assetTypeTemplate) {
        Path filepath = getAttFilePath(assetTypeTemplate, CONTENT_FILE_EXTENSION);
        try {
            return assetTypeTemplateService.exportAssetTypeTemplateToJsonFile(assetTypeTemplate, filepath.toFile(),
                    false);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private boolean writeUnitsContentToGitDir() {
        Path filepath = getEcosystemManagerFilePath(FILENAME_UNITS, CONTENT_FILE_EXTENSION);
        try {
            return unitService.exportAllToJsonFile(filepath.toFile(), true);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private boolean writeFieldsContentToGitDir() {
        Path filepath = getEcosystemManagerFilePath(FILENAME_FIELDS, CONTENT_FILE_EXTENSION);
        try {
            return fieldService.exportAllToJsonFile(filepath.toFile(), true);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private boolean writeAssetTypesContentToGitDir() {
        Path filepath = getEcosystemManagerFilePath(FILENAME_ASSET_TYPES, CONTENT_FILE_EXTENSION);
        try {
            return assetTypeService.exportAllToJsonFile(filepath.toFile(), true);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private ProcessingResultDto importFile(File file) {
        try {
            return tryImportOfFile(file);
        } catch (IOException e) {
            log.warn(ERROR_READING_FILE, file, e);
            return ProcessingResultDto.builder().build();
        }
    }


    private Path getAttFilePath(final AssetTypeTemplate assetTypeTemplate, final String extension) {
        final String filename = URLEncoder.encode(assetTypeTemplate.getAssetType().getLabel(), StandardCharsets.UTF_8)
                + "-V" + assetTypeTemplate.getPublishedVersion();
        return getAttFilePath(filename, extension);
    }

    private Path getAttFilePath(final String filename, final String extension) {
        return getAttDirPath().resolve(filename + extension);
    }

    private Path getEcosystemManagerFilePath(final String filename, final String extension) {
        return getEcosystemManagerDirPath().resolve(filename + extension);
    }

    private Path getAttDirPath() {
        return getEcosystemManagerDirPath().resolve(ATT_SUBDIR);
    }

    private Path getEcosystemManagerDirPath() {
        return modelRepoSyncService.getLocalGitPath().resolve(ECOSYSTEM_MANAGER_SUBDIR);
    }
}
