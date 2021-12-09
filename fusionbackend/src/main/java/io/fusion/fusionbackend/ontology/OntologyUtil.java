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

package io.fusion.fusionbackend.ontology;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import org.apache.jena.ontology.OntModel;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class OntologyUtil {
    public static void writeOwlOntologyModelToStreamUsingJena(
            OntModel ontModel, OutputStream outputStream) throws IOException {

        org.apache.jena.rdf.model.RDFWriterI w = ontModel.getWriter("turtle");

        w.setProperty("attributeQuoteChar","\"");
        w.setProperty("showXMLDeclaration","true");
        w.setProperty("tab","1");

        String base = ontModel.getNsPrefixURI("").substring(0, ontModel.getNsPrefixURI("").length() - 1);
        w.setProperty("xmlbase", base);
        w.write(ontModel, outputStream, base);

        outputStream.flush();
    }

    public static byte[] exportOwlOntologyModelToJsonUsingJena(final OntModel ontModel) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        writeOwlOntologyModelToStreamUsingJena(ontModel, outputStream);

        return outputStream.toByteArray();
    }
}
