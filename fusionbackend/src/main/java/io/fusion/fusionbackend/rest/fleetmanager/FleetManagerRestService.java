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

package io.fusion.fusionbackend.rest.fleetmanager;

import io.fusion.fusionbackend.dto.ImportResultDto;
import io.fusion.fusionbackend.dto.SyncResultDto;
import io.fusion.fusionbackend.rest.annotations.IsFleetUser;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import io.fusion.fusionbackend.service.export.EcosystemManagerImportExportService;
import io.fusion.fusionbackend.service.export.FleetManagerImportExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@IsFleetUser
public class FleetManagerRestService {
    private final FleetManagerImportExportService fleetManagerImportExportService;
    private final EcosystemManagerImportExportService ecosystemManagerImportExportService;

    @Autowired
    public FleetManagerRestService(FleetManagerImportExportService fleetManagerImportExportService,
                                   EcosystemManagerImportExportService ecosystemManagerImportExportService) {
        this.fleetManagerImportExportService = fleetManagerImportExportService;
        this.ecosystemManagerImportExportService = ecosystemManagerImportExportService;
    }

    @GetMapping(path = "/companies/{companyId}/fleetmanager/zipexport")
    public void getAsZipExport(@PathVariable final Long companyId,
                               HttpServletResponse response) throws IOException {
        response.setContentType("application/zip");
        response.addHeader("Content-Disposition", "attachment;filename=\"fleet_manager_exported.zip\"");
        fleetManagerImportExportService.exportEntitiesToStreamAsZip(companyId, response.getOutputStream());
    }

    @PutMapping(path = "/companies/{companyId}/fleetmanager/synctomodelrepo")
    public SyncResultDto syncToModelRepo(@PathVariable final Long companyId) {
        return fleetManagerImportExportService.syncWithModelRepo(companyId);
    }

    @PostMapping(path = "/companies/{companyId}/fleetmanager/import",
            consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<Object> importZip(@PathVariable final Long companyId,
                                            @RequestParam("zipFile") MultipartFile zipFile) throws IOException {
        BaseZipImportExport.checkFileSize(zipFile);
        ecosystemManagerImportExportService.importEntitiesFromZip(zipFile.getInputStream());
        return ResponseEntity.ok().build();
    }

    @PostMapping(path = "/fleet/{companyId}/template/import")
    public ImportResultDto importAssetSeriesShacl(
            HttpServletResponse response,
            @RequestParam MultipartFile file,
            @PathVariable final Long companyId) throws IOException {
        return fleetManagerImportExportService.importAssetTypeTemplate(file, companyId);
    }

    @GetMapping(path = "/fleet/{companyId}/asset/export/{id}")
    public void exportAssetNgsiLd(
            HttpServletResponse response,
            @PathVariable final Long companyId,
            @PathVariable final Long id) throws IOException {
        response.setContentType("application/zip");
        response.addHeader("Content-Disposition", "attachment;filename=\"asset_" + id + ".zip\"");
        fleetManagerImportExportService.exportAssetPackageAsZip(response.getOutputStream(), id);
    }

    @GetMapping(path = "/fleet/{companyId}/series/export/{id}")
    public void exportAssetSeriesShacl(
            HttpServletResponse response,
            @PathVariable final Long companyId,
            @PathVariable final Long id) throws IOException {
        response.setContentType("text/plain");
        response.addHeader("Content-Disposition", "attachment;filename=\"assetseries_" + id + ".ttl\"");
        fleetManagerImportExportService.exportSeriesPackage(response.getOutputStream(), companyId, id);
    }

}
