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

import io.fusion.fusionbackend.model.enums.QuantityDataType;
import org.apache.jena.ontology.EnumeratedClass;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFList;
import org.apache.jena.rdf.model.RDFNode;

import java.util.Arrays;
import java.util.HashMap;

public class QuantityTypeSchema {

    /**
     * .
     * The basic Ontology of an QuantityType
     */
    public static final String uri = "https://industry-fusion.com/quantityType-schema/1.0#";
    public static final OntModel m = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
    public static final Property name = m.createProperty(uri, "name");
    public static final Property description = m.createProperty(uri, "description");
    public static final Property label = m.createProperty(uri, "label");
    public static final Property dataType = m.createProperty(uri, "dataType");
    public static final Property units = m.createProperty(uri, "units");
    private HashMap<QuantityDataType, Property> dataTypeMap;

    public QuantityTypeSchema() {
        generateDataType();
    }

    private EnumeratedClass generateDataType() {
        dataTypeMap = new HashMap<>();
        Arrays.stream(QuantityDataType.values()).forEach(quantityDataType ->
                dataTypeMap.put(quantityDataType, m.createProperty(uri, quantityDataType.toString())));
        RDFList dataTypeList = m.createList(dataTypeMap.values().iterator());
        return m.createEnumeratedClass(uri + "QuantityDataType", dataTypeList);
    }

    public RDFNode getQuantityDataType(QuantityDataType quantityDataType) {
        return dataTypeMap.get(quantityDataType);
    }

    /**.
     * returns the URI for this schema
     *
     * @return the URI for this schema
     */
    public static String getUri() {
        return uri;
    }
}
