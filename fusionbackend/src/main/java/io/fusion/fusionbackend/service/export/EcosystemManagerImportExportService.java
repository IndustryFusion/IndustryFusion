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
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.service.AssetTypeService;
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
import io.fusion.fusionbackend.service.FieldService;
import io.fusion.fusionbackend.service.ModelRepoSyncService;
import io.fusion.fusionbackend.service.UnitService;
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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Set;
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
    private static final String ECOMAN_SUBDIR = "ecosystem";
    private final UnitService unitService;
    private final FieldService fieldService;
    private final AssetTypeService assetTypeService;
    private final AssetTypeTemplateService assetTypeTemplateService;
    private final ModelRepoSyncService modelRepoSyncService;
    private final OntologyBuilder ontologyBuilder;

    @Autowired
    public EcosystemManagerImportExportService(UnitService unitService,
                                               FieldService fieldService,
                                               AssetTypeService assetTypeService,
                                               AssetTypeTemplateService assetTypeTemplateService,
                                               ModelRepoSyncService modelRepoSyncService,
                                               OntologyBuilder ontologyBuilder) {
        this.unitService = unitService;
        this.fieldService = fieldService;
        this.assetTypeService = assetTypeService;
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.modelRepoSyncService = modelRepoSyncService;
        this.ontologyBuilder = ontologyBuilder;
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
        if (!importResult.isEntryImported
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
        int totalEntitySkippedCount = prevImportResult.totalEntitySkippedCount;
        if (isEntryImported) {
            switch (entry.getName()) {
                case FILENAME_UNITS + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += unitService.importMultipleFromJson(readZipEntry(entry, zipInputStream));
                    break;
                case FILENAME_FIELDS + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += fieldService.importMultipleFromJson(readZipEntry(entry, zipInputStream));
                    break;
                case FILENAME_ASSET_TYPES + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += assetTypeService
                            .importMultipleFromJson(readZipEntry(entry, zipInputStream));
                    break;
                case FILENAME_ASSET_TYPE_TEMPLATES + CONTENT_FILE_EXTENSION:
                    totalEntitySkippedCount += assetTypeTemplateService
                            .importMultipleFromJson(readZipEntry(entry, zipInputStream));
                    break;

                default:
                    isEntryImported = false;
            }
        }

        return new ImportResult(isEntryImported, totalEntitySkippedCount);
    }

    public void exportOntologyModelToStream(final OutputStream outputStream) throws IOException {
        OntModel model = ontologyBuilder.buildEcosystemOntology();
        OntologyUtil.writeOwlOntologyModelToStreamUsingJena(model, outputStream);
    }

    public SyncResultDto syncWithModelRepo() {
        if (modelRepoSyncService.pullRepo()) {
            exportAssetTypeTemplates();
            modelRepoSyncService.checkChangesAndSync();
        }
        return SyncResultDto.builder().build();
    }

    private void exportAssetTypeTemplates() {
        Set<AssetTypeTemplate> publishedAssetTypeTemplates =
                assetTypeTemplateService.getPublishedAssetTypeTemplates();
        long modelExportCount =
                publishedAssetTypeTemplates.stream().filter(this::writeAttModelToGitDir).count();
        log.info("Wrote {} from {} ATT models", modelExportCount, publishedAssetTypeTemplates.size());
        long contentExportCount =
                publishedAssetTypeTemplates.stream().filter(this::writeAttContentToGitDir).count();
        log.info("Wrote {} from {} ATT jsons", contentExportCount, publishedAssetTypeTemplates.size());
        writeUnitsContentToGitDir();
        log.info("Wrote units json");
        writeFieldsContentToGitDir();
        log.info("Wrote fields json");
        writeAssetTypesContentToGitDir();
        log.info("Wrote assettypes json");
    }

    private Boolean writeAttModelToGitDir(final AssetTypeTemplate assetTypeTemplate) {
        OntModel ontModel = ontologyBuilder.buildAssetTypeTemplateOntology(assetTypeTemplate);
        final Path filepath = getAttFilePath(assetTypeTemplate, MODEL_FILE_EXTENSION);
        try {
            return OntologyUtil.writeOntologyModelToFile(ontModel, filepath.toFile(), false);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private Boolean writeAttContentToGitDir(final AssetTypeTemplate assetTypeTemplate) {
        Path filepath = getAttFilePath(assetTypeTemplate, CONTENT_FILE_EXTENSION);
        try {
            return assetTypeTemplateService.exportAssetTypeTemplateToJsonFile(assetTypeTemplate, filepath.toFile(),
                    false);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private Boolean writeUnitsContentToGitDir() {
        Path filepath = getEcomanFilePath(FILENAME_UNITS, CONTENT_FILE_EXTENSION);
        try {
            return unitService.exportAllToJsonFile(filepath.toFile(), true);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private Boolean writeFieldsContentToGitDir() {
        Path filepath = getEcomanFilePath(FILENAME_FIELDS, CONTENT_FILE_EXTENSION);
        try {
            return fieldService.exportAllToJsonFile(filepath.toFile(), true);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private Boolean writeAssetTypesContentToGitDir() {
        Path filepath = getEcomanFilePath(FILENAME_ASSET_TYPES, CONTENT_FILE_EXTENSION);
        try {
            return assetTypeService.exportAllToJsonFile(filepath.toFile(), true);
        } catch (IOException e) {
            log.warn(ERROR_WRITING_FILE, filepath.toFile(), e);
            return false;
        }
    }

    private Path getAttFilePath(final AssetTypeTemplate assetTypeTemplate, final String extension) {
        final String filename = URLEncoder.encode(assetTypeTemplate.getAssetType().getLabel(), StandardCharsets.UTF_8)
                + "-V" + assetTypeTemplate.getPublishedVersion() + extension;
        return getEcomanFilePath(filename, extension);
    }

    private Path getEcomanFilePath(final String filename, final String extension) {
        return modelRepoSyncService.getLocalGitPath().resolve(ECOMAN_SUBDIR).resolve(filename + extension);
    }
}
