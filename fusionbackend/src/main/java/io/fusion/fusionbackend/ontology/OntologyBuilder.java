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
import io.fusion.fusionbackend.model.QuantityType;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.model.enums.FieldType;
import io.fusion.fusionbackend.service.FieldService;
import io.fusion.fusionbackend.service.UnitService;
import org.apache.jena.ontology.DatatypeProperty;
import org.apache.jena.ontology.OntClass;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.vocabulary.RDFS;
import org.apache.jena.vocabulary.XSD;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
public class OntologyBuilder {

    private final FieldService fieldService;
    private final UnitService unitService;
    private final OntModel fieldModel;
    private final OntModel unitModel;

    private static String uri ="https://industry-fusion.com/repository/";
    private static String uriFields = uri + "fields#";
    private static String uriATT = uri + "assetTypeTemplate#";
    private static String uriAS = uri + "assetSeries#";
    private static String uriUnits = uri + "units#";


    public OntologyBuilder(FieldService fieldService, UnitService unitService) {
        this.fieldService = fieldService;
        this.unitService = unitService;

        fieldModel = loadFieldModel();
        unitModel = loadUnitModel();
    }


    public OntModel buildAssetTypeTemplateOntology(AssetTypeTemplate assetTypeTemplate) {

        OntModel ontModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        ontModel.addSubModel(fieldModel);

        OntClass attClass = ontModel.createClass(uriATT+assetTypeTemplate.getId());
        attClass.addProperty(AssetTypeTemplateSchema.VERSION, assetTypeTemplate.getVersion().toString())
                .addProperty(AssetTypeTemplateSchema.NAME, assetTypeTemplate.getName())
                .addProperty(AssetTypeTemplateSchema.DESCRIPTION, assetTypeTemplate.getDescription())
                .addProperty(AssetTypeTemplateSchema.IMAGEKEY, assetTypeTemplate.getImageKey());

        assetTypeTemplate.getFieldTargets().stream().forEach(fieldTarget -> {

            DatatypeProperty fieldProperty = ontModel.createDatatypeProperty(
                    uriATT + assetTypeTemplate.getId()+"_"+fieldTarget.getLabel());
            fieldProperty.addDomain(attClass);
            addRange(fieldTarget.getField().getUnit().getQuantityType(), fieldProperty);

            addField(ontModel, fieldTarget.getField(), fieldProperty);
            addUnit(ontModel, fieldTarget.getField().getUnit(), fieldProperty);
            attClass.addProperty(fieldProperty, fieldTarget.getLabel());
        });

        createPrefixMap(ontModel);

        return ontModel;
    }

    private void addRange(QuantityType quantityType, DatatypeProperty fieldProperty) {
        switch (quantityType.getDataType()){
            case CATEGORICAL:
                fieldProperty.addRange(XSD.xstring);
                break;
            case NUMERIC:
                fieldProperty.addRange(XSD.xdouble);
                break;
        }
    }

    public OntModel buildAssetSeriesOntology(AssetSeries assetSeries) {
        OntModel ontModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        OntClass asClass = ontModel.createClass(uriAS + assetSeries.getId());
        ontModel.addSubModel(fieldModel);
        ontModel.addSubModel(unitModel);

        OntModel attModel = buildAssetTypeTemplateOntology(assetSeries.getAssetTypeTemplate());
        ontModel.addSubModel(attModel);

        asClass.addProperty(AssetSeriesSchema.version, assetSeries.getVersion().toString())
                .addProperty(AssetSeriesSchema.name, assetSeries.getName())
                .addProperty(AssetSeriesSchema.description, assetSeries.getDescription())
                .addProperty(AssetSeriesSchema.imageKey, assetSeries.getImageKey())
                .addProperty(RDFS.subClassOf, attModel.getOntClass(
                        uriATT + assetSeries.getAssetTypeTemplate().getId())
                );

        assetSeries.getFieldSources().forEach(fieldSource -> {
            DatatypeProperty fieldProperty = ontModel.createDatatypeProperty(
                    uriAS + assetSeries.getId()+"_"+fieldSource.getFieldTarget().getLabel());
            fieldProperty.addDomain(asClass);
            if (fieldSource.getFieldTarget().getFieldType().equals(FieldType.ATTRIBUTE) && fieldSource.getValue() != null){
                fieldProperty.addLiteral(AssetSeriesSchema.hasValue, fieldSource.getValue());
            }
            addUnit(ontModel, fieldSource.getSourceUnit(), fieldProperty);
            asClass.addProperty(fieldProperty, fieldSource.getFieldTarget().getLabel());
        });



        createPrefixMap(ontModel);
        ontModel.setNsPrefix("asschema", AssetSeriesSchema.getURI());
        ontModel.setNsPrefix("assetSeries", uriAS);
        return ontModel;
    }

    private void addField(OntModel ontModel, Field field, DatatypeProperty fieldProperty) {
        OntClass fieldClass = fieldModel.getOntClass(uriFields + field.getId());
        ontModel.add(fieldProperty, FieldSchema.hasField, fieldClass);
    }

    private void addUnit(OntModel ontModel, Unit unit, DatatypeProperty fieldProperty) {
        OntClass unitClass = unitModel.getOntClass(uriUnits + unit.getId());
        ontModel.add(fieldProperty, UnitSchema.hasUnit, unitClass);
    }

    private void createPrefixMap(OntModel ontModel) {
        HashMap<String, String> nsPrefix = new HashMap<>();
        nsPrefix.put("", uri);
        nsPrefix.put("field", uriFields);
        nsPrefix.put("unit", uriUnits);
        nsPrefix.put("assetTypeTemplate", uriATT);
        nsPrefix.put("attschema", AssetTypeTemplateSchema.getURI());
        nsPrefix.put("fieldschema", FieldSchema.getURI());
        nsPrefix.put("unitschema", UnitSchema.getURI());
        ontModel.setNsPrefixes(nsPrefix);
    }

    private OntClass generateFieldOntology(Field field, OntModel ontModel){
        FieldSchema fieldSchema = new FieldSchema();
        OntClass fieldClass = ontModel.createClass(uriFields + field.getId());
        fieldClass.addProperty(fieldSchema.hasThresholdProperty, fieldSchema.getThresholdTypeProperty(field.getThresholdType()));
        fieldClass.addProperty(fieldSchema.accuracy, field.getAccuracy().toString());
        fieldClass.addProperty(fieldSchema.name, field.getName());
        fieldClass.addProperty(fieldSchema.description, field.getDescription());

        return fieldClass;
    }

    @NotNull
    private OntModel loadFieldModel() {
        final OntModel fieldModel;
        fieldModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        this.fieldService.getAllFields().forEach(field -> generateFieldOntology(field, fieldModel));
        return fieldModel;
    }

    private OntClass generateUnitOntology(Unit unit, OntModel ontModel){
        OntClass fieldClass = ontModel.createClass(uriUnits + unit.getId());
        fieldClass.addProperty(UnitSchema.name, unit.getName());
        fieldClass.addProperty(UnitSchema.label, unit.getLabel());
        fieldClass.addProperty(UnitSchema.symbol, unit.getSymbol());

        return fieldClass;
    }

    @NotNull
    private OntModel loadUnitModel() {
        final OntModel unitModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        this.unitService.getAllUnits().forEach(unit -> generateUnitOntology(unit, unitModel));
        return unitModel;
    }

}
