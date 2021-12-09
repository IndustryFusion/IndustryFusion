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

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.QuantityType;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.model.enums.FieldType;
import io.fusion.fusionbackend.service.AssetTypeService;
import io.fusion.fusionbackend.service.FieldService;
import io.fusion.fusionbackend.service.UnitService;
import org.apache.jena.ontology.DatatypeProperty;
import org.apache.jena.ontology.OntClass;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.vocabulary.XSD;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Optional;

@Service
public class OntologyBuilder {

    private final FieldService fieldService;
    private final UnitService unitService;
    private final AssetTypeService assetTypeService;
    private final OntModel fieldModel;
    private final OntModel unitModel;
    private final OntModel assetTypeModel;

    private static String uri ="https://industry-fusion.com/repository/";
    private static String uriUnits = uri + "units#";
    private static String uriFields = uri + "fields#";
    private static String uriAT = uri + "assetType#";
    private static String uriATT = uri + "assetTypeTemplate#";
    private static String uriAS = uri + "assetSeries#";
    private static String uriAsset = uri + "assets#";


    public OntologyBuilder(FieldService fieldService, UnitService unitService, AssetTypeService assetTypeService) {
        this.fieldService = fieldService;
        this.unitService = unitService;
        this.assetTypeService = assetTypeService;

        fieldModel = loadFieldModel();
        unitModel = loadUnitModel();
        assetTypeModel = loadAssetTypeModel();
    }

    public OntModel buildAssetTypeTemplateOntology(AssetTypeTemplate assetTypeTemplate) {

        OntModel ontModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        ontModel.addSubModel(fieldModel);
        ontModel.addSubModel(assetTypeModel);

        OntClass attClass = ontModel.createClass(uriATT+assetTypeTemplate.getId());
        attClass.addSuperClass(assetTypeModel.getOntClass(uriAT + assetTypeTemplate.getAssetType().getId()));
        Optional.ofNullable(assetTypeTemplate.getVersion())
                .ifPresent(literal -> attClass.addLiteral(AssetTypeTemplateSchema.version, literal));
        Optional.ofNullable(assetTypeTemplate.getName())
                .ifPresent(literal -> attClass.addLiteral(AssetTypeTemplateSchema.name, literal));
        Optional.ofNullable(assetTypeTemplate.getDescription())
                .ifPresent(literal -> attClass.addLiteral(AssetTypeTemplateSchema.description, literal));
        Optional.ofNullable(assetTypeTemplate.getImageKey())
                .ifPresent(literal -> attClass.addLiteral(AssetTypeTemplateSchema.imageKey, literal));

        assetTypeTemplate.getFieldTargets().stream().forEach(fieldTarget -> {

            DatatypeProperty fieldProperty = ontModel.createDatatypeProperty(
                    uriATT + assetTypeTemplate.getId()+"_"+fieldTarget.getLabel());
            fieldProperty.addDomain(attClass);
            addRange(fieldTarget.getField().getUnit().getQuantityType(), fieldProperty);

            addField(ontModel, fieldTarget.getField(), fieldProperty);
            addUnit(ontModel, fieldTarget.getField().getUnit(), fieldProperty);
            attClass.addLiteral(fieldProperty, "");
        });

        assetTypeTemplate.getSubsystems().forEach(subsystem -> {
            OntModel subsystemModel = buildAssetTypeTemplateOntology(subsystem);
            ontModel.addSubModel(subsystemModel);
            OntClass subSystemClass = subsystemModel.getOntClass(uriATT + subsystem.getId());
            attClass.addProperty(AssetTypeTemplateSchema.subsystems, subSystemClass);
        });

        createPrefixMap(ontModel);

        return ontModel;
    }

    public OntModel buildAssetSeriesOntology(AssetSeries assetSeries) {
        OntModel ontModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        OntClass asClass = ontModel.createClass(uriAS + assetSeries.getId());

        OntModel attModel = buildAssetTypeTemplateOntology(assetSeries.getAssetTypeTemplate());
        ontModel.addSubModel(attModel);
        ontModel.addSubModel(fieldModel);
        ontModel.addSubModel(unitModel);

        asClass.addSuperClass(attModel.getOntClass(uriATT + assetSeries.getAssetTypeTemplate().getId()));
        Optional.ofNullable(assetSeries.getVersion())
                .ifPresent(literal -> asClass.addLiteral(AssetSeriesSchema.version, literal));
        Optional.ofNullable(assetSeries.getName())
                .ifPresent(literal -> asClass.addLiteral(AssetSeriesSchema.name, literal));
        Optional.ofNullable(assetSeries.getDescription())
                .ifPresent(literal -> asClass.addLiteral(AssetSeriesSchema.description, literal));
        Optional.ofNullable(assetSeries.getImageKey())
                .ifPresent(literal -> asClass.addLiteral(AssetSeriesSchema.imageKey, literal));


        assetSeries.getFieldSources().forEach(fieldSource -> {
            DatatypeProperty fieldProperty = ontModel.createDatatypeProperty(
                    uriAS + assetSeries.getId()+"_"+fieldSource.getFieldTarget().getLabel());
            fieldProperty.addDomain(asClass);

            addUnit(ontModel, fieldSource.getSourceUnit(), fieldProperty);
            if (fieldSource.getFieldTarget().getFieldType().equals(FieldType.ATTRIBUTE) && fieldSource.getValue() != null){
                asClass.addLiteral(fieldProperty, fieldSource.getValue());
            } else {
                asClass.addLiteral(fieldProperty, "");
            }
        });

        createPrefixMap(ontModel);
        return ontModel;
    }

    public OntModel buildAssetOntology(Asset asset) {
        OntModel ontModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        OntModel asModel = buildAssetSeriesOntology(asset.getAssetSeries());
        ontModel.addSubModel(asModel);


        OntClass assetClass = ontModel.createClass(uriAsset + asset.getId());
        assetClass.addSuperClass(asModel.getOntClass(uriAS + asset.getAssetSeries().getId()));
        Optional.ofNullable(asset.getGuid())
                .ifPresent(literal -> assetClass.addLiteral(AssetSchema.guid, literal));
        Optional.ofNullable(asset.getCeCertified())
                .ifPresent(literal -> assetClass.addLiteral(AssetSchema.ceCertified, literal));
        Optional.ofNullable(asset.getSerialNumber())
                .ifPresent(literal -> assetClass.addLiteral(AssetSchema.serialNumber, literal));
        Optional.ofNullable(asset.getConstructionDate())
                .ifPresent(literal -> assetClass.addLiteral(AssetSchema.constructionDate, literal));
        Optional.ofNullable(asset.getProtectionClass())
                .ifPresent(literal -> assetClass.addLiteral(AssetSchema.protectionClass, literal));
        Optional.ofNullable(asset.getHandbookUrl())
                .ifPresent(literal -> assetClass.addLiteral(AssetSchema.handbookUrl, literal));
        Optional.ofNullable(asset.getVideoUrl())
                .ifPresent(literal -> assetClass.addLiteral(AssetSchema.videoUrl, literal));

        asset.getSubsystems().forEach(subsystem -> {
            OntModel subsystemModel = buildAssetOntology(subsystem);
            ontModel.addSubModel(subsystemModel);
            OntClass subSystemClass = subsystemModel.getOntClass(uriAsset + subsystem.getId());
            assetClass.addProperty(AssetSchema.subsystems, subSystemClass);
        });

        asset.getFieldInstances().forEach(fieldInstance -> {
            DatatypeProperty fieldProperty = ontModel.createDatatypeProperty(
                    uriAsset + asset.getId()+"_"+fieldInstance.getFieldSource().getFieldTarget().getLabel());
            fieldProperty.addDomain(assetClass);
            if (fieldInstance.getFieldSource().getFieldTarget().getFieldType().equals(FieldType.ATTRIBUTE) && fieldInstance.getValue() != null){
                assetClass.addLiteral(fieldProperty, fieldInstance.getValue());
            } else {
                assetClass.addLiteral(fieldProperty, "");
            }
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
        nsPrefix.put("assetType", uriAT);
        nsPrefix.put("assetTypeTemplate", uriATT);
        nsPrefix.put("assetSeries", uriAS);
        nsPrefix.put("asset", uriAsset);
        nsPrefix.put("assetschema", AssetSchema.getURI());
        nsPrefix.put("asschema", AssetSeriesSchema.getURI());
        nsPrefix.put("attschema", AssetTypeTemplateSchema.getURI());
        nsPrefix.put("atschema", AssetTypeSchema.getURI());
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

    private OntClass generateAssetTypeOntology(AssetType assetType, OntModel ontModel){
        OntClass fieldClass = ontModel.createClass(uriAT + assetType.getId());
        fieldClass.addProperty(AssetTypeSchema.name, assetType.getName());
        fieldClass.addProperty(AssetTypeSchema.label, assetType.getLabel());
        fieldClass.addProperty(AssetTypeSchema.description, assetType.getDescription());

        return fieldClass;
    }

    @NotNull
    private OntModel loadAssetTypeModel() {
        final OntModel assetTypeModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        this.assetTypeService.getAllAssetTypes().forEach(assetType -> generateAssetTypeOntology(assetType, assetTypeModel));
        return assetTypeModel;
    }

}
