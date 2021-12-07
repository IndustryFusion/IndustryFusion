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

import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.service.FieldService;
import org.apache.jena.ontology.DatatypeProperty;
import org.apache.jena.ontology.OntClass;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.vocabulary.XSD;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
public class OntologyBuilder {

    private final FieldService fieldService;
    private final OntModel fieldModel;


    public OntologyBuilder(FieldService fieldService) {
        this.fieldService = fieldService;

        fieldModel = loadFieldModel();
    }

    @NotNull
    private OntModel loadFieldModel() {
        final OntModel fieldModel;
        fieldModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        this.fieldService.getAllFields().forEach(field -> generateFieldOntology(field, fieldModel));
        return fieldModel;
    }

    private static String uri ="https://industry-fusion.com/repository/";
    public OntModel buildAssetTypeTemplateOntology(AssetTypeTemplate assetTypeTemplate) {

        OntModel ontModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);

        OntClass attClass = ontModel.createClass(uri+"assetTypeTemplate#"+assetTypeTemplate.getId());
        attClass.addProperty(AssetTypeTemplateSchema.VERSION, assetTypeTemplate.getVersion().toString())
                .addProperty(AssetTypeTemplateSchema.NAME, assetTypeTemplate.getName())
                .addProperty(AssetTypeTemplateSchema.DESCRIPTION, assetTypeTemplate.getDescription())
                .addProperty(AssetTypeTemplateSchema.IMAGEKEY, assetTypeTemplate.getImageKey());

        assetTypeTemplate.getFieldTargets().stream().forEach(fieldTarget -> {

            OntClass fieldClass = fieldModel.getOntClass(uri + "fields#" + fieldTarget.getField().getId());

            DatatypeProperty fieldProperty = ontModel.createDatatypeProperty(
                    uri + "assetTypeTemplate#" + assetTypeTemplate.getId()+"_"+fieldTarget.getLabel());
            fieldProperty.addDomain(attClass);
            fieldProperty.addRange(XSD.integer);
            fieldProperty.addIsDefinedBy(fieldClass);
            attClass.addProperty(fieldProperty, fieldTarget.getLabel());
        });

        createPrefixMap(ontModel);

        return ontModel;
    }

    public OntModel buildAssetSeriesOntology(AssetSeries assetSeries) {
        OntModel ontModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        OntClass asClass = ontModel.createClass(uri+"assetSeries#"+assetSeries.getId());

        OntModel attModel = buildAssetTypeTemplateOntology(assetSeries.getAssetTypeTemplate());

        asClass.addProperty(AssetSeriesSchema.version, assetSeries.getVersion().toString())
                .addProperty(AssetSeriesSchema.name, assetSeries.getName())
                .addProperty(AssetSeriesSchema.description, assetSeries.getDescription())
                .addProperty(AssetSeriesSchema.imageKey, assetSeries.getImageKey())
                .addProperty(
                        AssetSeriesSchema.assetTypeTemplate, attModel.getOntClass(
                        uri+"assetTypeTemplate#"+assetSeries.getAssetTypeTemplate().getId())
                );

        assetSeries.getFieldSources().forEach(fieldSource -> {
            OntClass fieldClass = fieldModel.getOntClass(uri + "fields#" + fieldSource.getFieldTarget().getField().getId());
            DatatypeProperty fieldProperty = ontModel.createDatatypeProperty(
                    uri + "assetTypeTemplate#" + assetSeries.getId()+"_"+fieldSource.getFieldTarget().getLabel());
            fieldProperty.addDomain(asClass);
            fieldProperty.addRange(XSD.integer);
            fieldProperty.addIsDefinedBy(fieldClass);
            asClass.addProperty(fieldProperty, fieldSource.getFieldTarget().getLabel());
        });



        createPrefixMap(ontModel);
        ontModel.setNsPrefix("asschema", AssetSeriesSchema.getURI());
        ontModel.setNsPrefix("assetSeries", uri+"assetSeries#");
        return ontModel;
    }

    private void createPrefixMap(OntModel ontModel) {
        HashMap<String, String> nsPrefix = new HashMap<>();
        nsPrefix.put("", uri);
        nsPrefix.put("field", uri+"fields#");
        nsPrefix.put("assetTypeTemplate", uri+"assetTypeTemplate#");
        nsPrefix.put("attschema", AssetTypeTemplateSchema.getURI());
        nsPrefix.put("fieldschema", FieldSchema.getURI());
        ontModel.setNsPrefixes(nsPrefix);
    }

    private OntClass generateFieldOntology(Field field, OntModel ontModel){
        FieldSchema fieldSchema = new FieldSchema();
        OntClass fieldClass = ontModel.createClass(uri + "fields#" + field.getId());
        fieldClass.addProperty(fieldSchema.hasThresholdProperty, fieldSchema.getThresholdTypeProperty(field.getThresholdType()));
        fieldClass.addProperty(fieldSchema.hasThresholdProperty, field.getAccuracy().toString());
        fieldClass.addProperty(fieldSchema.name, field.getName());
        fieldClass.addProperty(fieldSchema.description, field.getDescription());

        return fieldClass;
    }

}
