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

import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;

public class AssetSchema {

    /**.
     * The basic Ontology of an Asset
     */
    public static final String uri = "https://industry-fusion.com/asset-schema/1.0#";
    public static final Model m = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
    public static final Property id = m.createProperty(uri, "id");
    public static final Property guid = m.createProperty(uri, "guid");
    public static final Property ceCertified = m.createProperty(uri, "ceCertified");
    public static final Property serialNumber = m.createProperty(uri, "serialNumber");
    public static final Property constructionDate = m.createProperty(uri, "constructionDate");
    public static final Property protectionClass = m.createProperty(uri, "protectionClass");
    public static final Property handbookUrl = m.createProperty(uri, "handbookUrl");
    public static final Property videoUrl = m.createProperty(uri, "videoUrl");
    public static final Property subsystems = m.createProperty(uri, "subsystems");

    /**.
     * returns the URI for this schema
     *
     * @return the URI for this schema
     */
    public static String getUri() {
        return uri;
    }
}
