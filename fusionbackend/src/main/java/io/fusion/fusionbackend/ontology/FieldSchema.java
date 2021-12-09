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

import io.fusion.fusionbackend.model.enums.FieldThresholdType;
import org.apache.jena.ontology.EnumeratedClass;
import org.apache.jena.ontology.ObjectProperty;
import org.apache.jena.ontology.OntClass;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFList;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.vocabulary.XSD;

import java.util.Arrays;
import java.util.HashMap;

public class FieldSchema {

    /**
     * The basic Ontology of an Field
     */
    public static final String uri = "https://industry-fusion.com/field-schema/1.0#";
    private static final OntModel model = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
    public static final OntClass fieldClass = model.createClass(uri + "Field");
    public static final ObjectProperty hasThresholdProperty = model.createObjectProperty(uri+"hasThreshold");;
    public static final ObjectProperty accuracy = model.createObjectProperty(uri+"accuracy");
    public static final ObjectProperty name = model.createObjectProperty(uri+"name");
    public static final Property hasField = model.createProperty(uri, "hasField");
    public static final ObjectProperty description = model.createObjectProperty(uri+"description");

    private HashMap<FieldThresholdType, Property> fieldThresholdTypeMap;



    public FieldSchema() {
        EnumeratedClass thresholdType = generateThresholdType(model);

        hasThresholdProperty.addDomain(fieldClass);
        hasThresholdProperty.addRange(thresholdType);

        accuracy.addDomain(fieldClass);
        accuracy.addRange(XSD.xdouble);

        name.addDomain(fieldClass);
        name.addRange(XSD.xstring);

        description.addDomain(fieldClass);
        description.addRange(XSD.xstring);
    }

    public static OntModel getModel() {
        return model;
    }

    private EnumeratedClass generateThresholdType(OntModel ontModel){
        fieldThresholdTypeMap = new HashMap<>();
        Arrays.stream(FieldThresholdType.values()).forEach(fieldThresholdType ->
                fieldThresholdTypeMap.put(fieldThresholdType,ontModel.createProperty(uri, fieldThresholdType.toString())));
        RDFList thresholdTypeList = ontModel.createList(fieldThresholdTypeMap.values().iterator());
        return ontModel.createEnumeratedClass(uri+"ThresholdType", thresholdTypeList);
    }

    /**
     * returns the URI for this schema
     *
     * @return the URI for this schema
     */
    public static String getURI() {
        return uri;
    }

    public RDFNode getThresholdTypeProperty(FieldThresholdType fieldThresholdType){
        return fieldThresholdTypeMap.get(fieldThresholdType);
    }
}
