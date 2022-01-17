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

import io.fusion.fusionbackend.model.enums.QuantityDataType;
import org.apache.jena.ontology.EnumeratedClass;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFList;
import org.apache.jena.rdf.model.RDFNode;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.Map;

/**
 * .
 * The basic Ontology of an QuantityType
 */
public class QuantityTypeSchema {
    public static final String URI = "https://industry-fusion.com/quantityType-schema/1.0#";
    public static final OntModel m = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
    public static final Property name = m.createProperty(URI, "name");
    public static final Property description = m.createProperty(URI, "description");
    public static final Property label = m.createProperty(URI, "label");
    public static final Property dataType = m.createProperty(URI, "dataType");
    public static final Property units = m.createProperty(URI, "units");
    private Map<QuantityDataType, Property> dataTypeMap;

    public QuantityTypeSchema() {
        generateDataType();
    }

    /**
     * .
     * returns the URI for this schema
     *
     * @return the URI for this schema
     */
    public static String getUri() {
        return URI;
    }

    private EnumeratedClass generateDataType() {
        dataTypeMap = new EnumMap<>(QuantityDataType.class);
        Arrays.stream(QuantityDataType.values()).forEach(quantityDataType ->
                dataTypeMap.put(quantityDataType, m.createProperty(URI, quantityDataType.toString())));
        RDFList dataTypeList = m.createList(dataTypeMap.values().iterator());
        return m.createEnumeratedClass(URI + "QuantityDataType", dataTypeList);
    }

    public RDFNode getQuantityDataType(QuantityDataType quantityDataType) {
        return dataTypeMap.get(quantityDataType);
    }
}
