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

import io.fusion.fusionbackend.service.AssetSeriesService;
import io.fusion.fusionbackend.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
@Transactional
public class FleetManagerImportExportService extends BaseZipImportExport {
    private final AssetSeriesService assetSeriesService;
    private final AssetService assetService;

    private final EcosystemManagerImportExportService ecosystemManagerImportExportService;

    private static final String FILENAME_ASSET_SERIES = "AssetSeries.json";
    private static final String FILENAME_ASSETS = "Assets.json";


    @Autowired
    public FleetManagerImportExportService(AssetSeriesService assetSeriesService,
                                           AssetService assetService,
                                           EcosystemManagerImportExportService ecosystemManagerImportExportService) {
        this.assetSeriesService = assetSeriesService;
        this.assetService = assetService;
        this.ecosystemManagerImportExportService = ecosystemManagerImportExportService;
    }

    public void exportEntitiesToStreamAsZip(final Long companyId,
                                            final OutputStream responseOutputStream) throws IOException {

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {

            // Order is crucial
            ecosystemManagerImportExportService.writeEntitiesToZipOutputStream(zipOutputStream);

            addFileToZipOutputStream(zipOutputStream, FILENAME_ASSET_SERIES,
                    assetSeriesService.exportAllToJson(companyId));

            addFileToZipOutputStream(zipOutputStream, FILENAME_ASSETS,
                    assetService.exportAllToJson(companyId));

        } catch (IOException ioe) {
            ioe.printStackTrace();
            throw new IOException(ioe.getMessage());
        }

        responseOutputStream.write(byteArrayOutputStream.toByteArray());
        responseOutputStream.close();
    }

    public void importEntitiesFromZip(final Long companyId,
                                      final InputStream inputStream) throws IOException {
        super.importEntitiesFromZip(companyId, inputStream);
    }

    @Override
    protected ImportResult importZipEntry(final ZipEntry entry,
                                          final ZipInputStream zipInputStream,
                                          final Long companyId) throws IOException {
        ImportResult importResult = ecosystemManagerImportExportService.tryImportOfZipEntry(entry, zipInputStream,
                ImportResult.empty());

        if (!importResult.isEntryImported) {
            throw new UnsupportedOperationException("File can not be imported, filename unknown.");
        }

        return importResult;
    }
}