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

import io.fusion.fusionbackend.service.AssetTypeService;
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
import io.fusion.fusionbackend.service.FieldService;
import io.fusion.fusionbackend.service.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
@Transactional
public class EcosystemManagerImportExportService extends BaseZipImportExport {
    private final UnitService unitService;
    private final FieldService fieldService;
    private final AssetTypeService assetTypeService;
    private final AssetTypeTemplateService assetTypeTemplateService;

    private static final String FILENAME_UNITS = "Units.json";
    private static final String FILENAME_FIELDS = "Fields.json";
    private static final String FILENAME_ASSET_TYPES = "AssetTypes.json";
    private static final String FILENAME_PUBLISHED_ASSET_TYPE_TEMPLATES = "PublishedAssetTypeTemplates.json";


    @Autowired
    public EcosystemManagerImportExportService(UnitService unitService,
                                               FieldService fieldService,
                                               AssetTypeService assetTypeService,
                                               AssetTypeTemplateService assetTypeTemplateService) {
        this.unitService = unitService;
        this.fieldService = fieldService;
        this.assetTypeService = assetTypeService;
        this.assetTypeTemplateService = assetTypeTemplateService;
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
        addFileToZipOutputStream(zipOutputStream, FILENAME_UNITS, unitService.exportAllToJson());
        addFileToZipOutputStream(zipOutputStream, FILENAME_FIELDS, fieldService.exportAllToJson());
        addFileToZipOutputStream(zipOutputStream, FILENAME_ASSET_TYPES, assetTypeService.exportAllToJson());
        addFileToZipOutputStream(zipOutputStream, FILENAME_PUBLISHED_ASSET_TYPE_TEMPLATES,
                assetTypeTemplateService.exportAllToJson());
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
        if (!importResult.isEntryImported) {
            if (!entry.getName().equals(FleetManagerImportExportService.FILENAME_ASSET_SERIES)
                    && !entry.getName().equals(FleetManagerImportExportService.FILENAME_ASSETS)) {
                throw new UnsupportedOperationException("File can not be imported, filename unknown.");
            }
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
                case FILENAME_UNITS:
                    totalEntitySkippedCount += unitService.importMultipleFromJson(readZipEntry(entry, zipInputStream));
                    break;
                case FILENAME_FIELDS:
                    totalEntitySkippedCount += fieldService.importMultipleFromJson(readZipEntry(entry, zipInputStream));
                    break;
                case FILENAME_ASSET_TYPES:
                    totalEntitySkippedCount += assetTypeService
                            .importMultipleFromJson(readZipEntry(entry, zipInputStream));
                    break;
                case FILENAME_PUBLISHED_ASSET_TYPE_TEMPLATES:
                    totalEntitySkippedCount += assetTypeTemplateService
                            .importMultipleFromJson(readZipEntry(entry, zipInputStream));
                    break;

                default:
                    isEntryImported = false;
            }
        }

        return new ImportResult(isEntryImported, totalEntitySkippedCount);
    }
}
