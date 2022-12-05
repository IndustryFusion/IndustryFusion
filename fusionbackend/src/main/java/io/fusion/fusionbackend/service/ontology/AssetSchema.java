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

package io.fusion.fusionbackend.service.ontology;

import lombok.experimental.UtilityClass;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;

/**.
 * The basic Ontology of an Asset
 */
@UtilityClass
public class AssetSchema {
    public static final String URI = "https://industry-fusion.com/asset-schema/1.0#";
    public static final Model m = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
    public static final Property id = m.createProperty(URI, "id");
    public static final Property guid = m.createProperty(URI, "guid");
    public static final Property ceCertified = m.createProperty(URI, "ceCertified");
    public static final Property serialNumber = m.createProperty(URI, "serialNumber");
    public static final Property constructionDate = m.createProperty(URI, "constructionDate");
    public static final Property protectionClass = m.createProperty(URI, "protectionClass");
    public static final Property manualKey = m.createProperty(URI, "manualKey");
    public static final Property videoKey = m.createProperty(URI, "videoKey");
    public static final Property subsystems = m.createProperty(URI, "subsystems");

    /**.
     * returns the URI for this schema
     *
     * @return the URI for this schema
     */
    public static String getUri() {
        return URI;
    }
}
