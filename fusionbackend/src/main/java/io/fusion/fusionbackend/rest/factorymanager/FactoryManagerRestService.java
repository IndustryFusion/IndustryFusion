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

package io.fusion.fusionbackend.rest.factorymanager;

import io.fusion.fusionbackend.rest.annotations.IsFactoryUser;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import io.fusion.fusionbackend.service.export.EcosystemManagerImportExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@IsFactoryUser
public class FactoryManagerRestService {
    private final EcosystemManagerImportExportService ecosystemManagerImportExportService;

    @Autowired
    public FactoryManagerRestService(EcosystemManagerImportExportService ecosystemManagerImportExportService) {
        this.ecosystemManagerImportExportService = ecosystemManagerImportExportService;
    }

    @PostMapping(path = "/companies/{companyId}/factorymanager/import",
            consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Object> importZip(@PathVariable final Long companyId,
                                            @RequestParam("zipFile") MultipartFile zipFile) throws IOException {
        BaseZipImportExport.checkFileSize(zipFile);
        ecosystemManagerImportExportService.importEntitiesFromZip(zipFile.getInputStream());
        return ResponseEntity.ok().build();
    }
}
