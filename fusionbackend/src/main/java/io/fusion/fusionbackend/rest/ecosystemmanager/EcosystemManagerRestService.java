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

package io.fusion.fusionbackend.rest.ecosystemmanager;

import io.fusion.fusionbackend.ontology.OntologyBuilder;
import io.fusion.fusionbackend.ontology.OntologyUtil;
import io.fusion.fusionbackend.rest.annotations.IsEcosystemUser;
import io.fusion.fusionbackend.service.export.EcosystemManagerImportExportService;
import org.apache.jena.ontology.OntModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@IsEcosystemUser
public class EcosystemManagerRestService {
    private final EcosystemManagerImportExportService ecosystemManagerImportExportService;
    private final OntologyBuilder ontologyBuilder;

    @Autowired
    public EcosystemManagerRestService(
            EcosystemManagerImportExportService ecosystemManagerImportExportService,
            OntologyBuilder ontologyBuilder
    ) {
        this.ecosystemManagerImportExportService = ecosystemManagerImportExportService;
        this.ontologyBuilder = ontologyBuilder;
    }

    @GetMapping(path = "/export")
    public void getAsZipExport(HttpServletResponse response) throws IOException {
        response.setContentType("application/zip");
        response.addHeader("Content-Disposition","attachment;filename=\"ecosystem_manager_exported.zip\"");
        ecosystemManagerImportExportService.exportEntitiesToStreamAsZip(response.getOutputStream());
    }

    @GetMapping(path = "/owlexport")
    public void getAsOwlExport(HttpServletResponse response) throws IOException {
        response.addHeader("Content-Disposition","attachment;filename=\"ecosystem_manager.owl\"");
        OntModel model = ontologyBuilder.buildEcosystemOntology();
        OntologyUtil.writeOwlOntologyModelToStreamUsingJena(model, response.getOutputStream());
    }

}
