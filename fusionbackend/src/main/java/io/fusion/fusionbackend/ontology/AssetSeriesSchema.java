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

public class AssetSeriesSchema {

    /**
     * The basic Ontology of an AssetSeries
     */
    public static final String uri = "https://industry-fusion.com/as-schema/1.0#";
    public static final Model m = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
    public static final Property id = m.createProperty(uri, "id");
    public static final Property version = m.createProperty(uri, "version");
    public static final Property name = m.createProperty(uri, "name");
    public static final Property description = m.createProperty(uri, "description");
    public static final Property imageKey = m.createProperty(uri, "imageKey");
    public static final Property assetTypeTemplate = m.createProperty(uri, "assetTypeTemplate");
    public static final Property hasValue = m.createProperty(uri, "hasValue");

    /**
     * returns the URI for this schema
     *
     * @return the URI for this schema
     */
    public static String getURI() {
        return uri;
    }
}
