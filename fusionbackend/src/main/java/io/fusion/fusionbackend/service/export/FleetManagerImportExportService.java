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
import io.fusion.fusionbackend.service.ontology.OntologyUtil;
import org.apache.jena.ontology.OntModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
@Transactional
public class FleetManagerImportExportService extends BaseZipImportExport {
    private final AssetSeriesService assetSeriesService;
    private final AssetService assetService;

    private final EcosystemManagerImportExportService ecosystemManagerImportExportService;
    private final AssetYamlExportService assetYamlExportService;

    public static final String FILENAME_ASSET_SERIES = "AssetSeries.json";
    public static final String FILENAME_ASSETS = "Assets.json";
    public static final String FILENAME_ASSET = "Asset.json";
    public static final String FILENAME_NGSI_LD = "NGSI-LD.json";
    public static final String FILENAME_OWL = "Owl.ttl";
    public static final String FILENAME_APPLICATION_YAML = "application.yaml";


    @Autowired
    public FleetManagerImportExportService(AssetSeriesService assetSeriesService,
                                           AssetService assetService,
                                           EcosystemManagerImportExportService ecosystemManagerImportExportService,
                                           AssetYamlExportService assetYamlExportService) {
        this.assetSeriesService = assetSeriesService;
        this.assetService = assetService;
        this.ecosystemManagerImportExportService = ecosystemManagerImportExportService;
        this.assetYamlExportService = assetYamlExportService;
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
                    assetService.exportAllFleetAssetsToJson(companyId));

        } catch (IOException ioe) {
            ioe.printStackTrace();
            throw new IOException(ioe.getMessage());
        }

        responseOutputStream.write(byteArrayOutputStream.toByteArray());
        responseOutputStream.close();
    }

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
                case FILENAME_ASSET_SERIES:
                    totalEntitySkippedCount += assetSeriesService
                            .importMultipleFromJson(readZipEntry(entry, zipInputStream), companyId);
                    break;
                case FILENAME_ASSETS:
                case FILENAME_ASSET:
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

            addFileToZipOutputStream(zipOutputStream, FILENAME_ASSET,
                    assetService.exportFleetAssetsToJson(companyId, assetId));

            String assetNgsiLd = assetService.getAssetByIdAsNgsiLD(assetId);
            addFileToZipOutputStream(zipOutputStream, FILENAME_NGSI_LD, assetNgsiLd.getBytes(StandardCharsets.UTF_8));

            OntModel assetOntModel = assetSeriesService.getAssetSeriesRdf(assetSeriesId, companyId);
            addFileToZipOutputStream(zipOutputStream, FILENAME_OWL,
                    OntologyUtil.exportOwlOntologyModelToJsonUsingJena(assetOntModel));

            addFileToZipOutputStream(zipOutputStream, FILENAME_APPLICATION_YAML,
                     assetYamlExportService.createYamlFile(assetService.getAssetById(assetId)));

        } catch (IOException ioe) {
            ioe.printStackTrace();
            throw new IOException(ioe.getMessage());
        }

        responseOutputStream.write(byteArrayOutputStream.toByteArray());
        responseOutputStream.close();
    }
}