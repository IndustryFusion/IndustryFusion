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
import io.fusion.fusionbackend.service.QuantityTypeService;
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
    private final QuantityTypeService quantityTypeService;
    private final OntModel fieldModel;
    private final OntModel unitModel;
    private final OntModel assetTypeModel;
    private final OntModel quantityTypeModel;

    private static final String URI = "https://industry-fusion.com/repository/";
    private static final String URI_QUANTITY_TYPE = URI + "quantityType#";
    private static final String URI_UNITS = URI + "units#";
    private static final String URI_FIELDS = URI + "fields#";
    private static final String URI_AT = URI + "assetType#";
    private static final String URI_ATT = URI + "assetTypeTemplate#";
    private static final String URI_AS = URI + "assetSeries#";
    private static final String URI_ASSET = URI + "assets#";

    public OntologyBuilder(FieldService fieldService,
                           UnitService unitService,
                           AssetTypeService assetTypeService,
                           QuantityTypeService quantityTypeService) {
        this.fieldService = fieldService;
        this.unitService = unitService;
        this.assetTypeService = assetTypeService;
        this.quantityTypeService = quantityTypeService;

        fieldModel = loadFieldModel();
        unitModel = loadUnitModel();
        assetTypeModel = loadAssetTypeModel();
        quantityTypeModel = loadQuantityTypeModel();
    }

    public OntModel buildAssetTypeTemplateOntology(AssetTypeTemplate assetTypeTemplate) {

        OntModel ontModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        ontModel.addSubModel(fieldModel);
        ontModel.addSubModel(assetTypeModel);
        ontModel.addSubModel(quantityTypeModel);

        OntClass attClass = ontModel.createClass(URI_ATT + assetTypeTemplate.getId());
        attClass.addSuperClass(assetTypeModel.getOntClass(URI_AT + assetTypeTemplate.getAssetType().getId()));
        Optional.ofNullable(assetTypeTemplate.getVersion())
                .ifPresent(literal -> attClass.addLiteral(AssetTypeTemplateSchema.version, literal));
        Optional.ofNullable(assetTypeTemplate.getName())
                .ifPresent(literal -> attClass.addLiteral(AssetTypeTemplateSchema.name, literal));
        Optional.ofNullable(assetTypeTemplate.getDescription())
                .ifPresent(literal -> attClass.addLiteral(AssetTypeTemplateSchema.description, literal));
        Optional.ofNullable(assetTypeTemplate.getImageKey())
                .ifPresent(literal -> attClass.addLiteral(AssetTypeTemplateSchema.imageKey, literal));

        assetTypeTemplate.getFieldTargets().forEach(fieldTarget -> {

            DatatypeProperty fieldProperty = ontModel.createDatatypeProperty(
                    URI_ATT + assetTypeTemplate.getId() + "_" + fieldTarget.getLabel());
            fieldProperty.addDomain(attClass);
            Optional.ofNullable(fieldTarget.getField().getUnit())
                    .ifPresent(unit -> addRange(unit.getQuantityType(), fieldProperty));

            addField(ontModel, fieldTarget.getField(), fieldProperty);

            Optional.ofNullable(fieldTarget.getField().getUnit())
                    .ifPresent(unit -> {
                        OntClass quantityTypeModelOntClass = quantityTypeModel
                                .getOntClass(URI_QUANTITY_TYPE + unit.getQuantityType().getId());
                        fieldProperty.addProperty(AssetTypeTemplateSchema.quantityType, quantityTypeModelOntClass);
                    });

            attClass.addLiteral(fieldProperty, "");
        });

        assetTypeTemplate.getSubsystems().forEach(subsystem -> {
            OntModel subsystemModel = buildAssetTypeTemplateOntology(subsystem);
            ontModel.addSubModel(subsystemModel);
            OntClass subSystemClass = subsystemModel.getOntClass(URI_ATT + subsystem.getId());
            attClass.addProperty(AssetTypeTemplateSchema.subsystems, subSystemClass);
        });

        createPrefixMap(ontModel);

        return ontModel;
    }

    public OntModel buildAssetSeriesOntology(AssetSeries assetSeries) {
        OntModel ontModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);

        OntModel attModel = buildAssetTypeTemplateOntology(assetSeries.getAssetTypeTemplate());
        ontModel.addSubModel(attModel);
        ontModel.addSubModel(fieldModel);
        ontModel.addSubModel(unitModel);

        OntClass asClass = ontModel.createClass(URI_AS + assetSeries.getId());
        asClass.addSuperClass(attModel.getOntClass(URI_ATT + assetSeries.getAssetTypeTemplate().getId()));
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
                    URI_AS + assetSeries.getId() + "_" + fieldSource.getFieldTarget().getLabel());
            fieldProperty.addDomain(asClass);

            addUnit(ontModel, fieldSource.getSourceUnit(), fieldProperty);
            if (fieldSource.getFieldTarget().getFieldType().equals(FieldType.ATTRIBUTE)
                    && fieldSource.getValue() != null) {
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


        OntClass assetClass = ontModel.createClass(URI_ASSET + asset.getId());
        assetClass.addSuperClass(asModel.getOntClass(URI_AS + asset.getAssetSeries().getId()));
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
        Optional.ofNullable(asset.getManualKey())
                .ifPresent(literal -> assetClass.addLiteral(AssetSchema.manualKey, literal));
        Optional.ofNullable(asset.getVideoKey())
                .ifPresent(literal -> assetClass.addLiteral(AssetSchema.videoKey, literal));

        asset.getSubsystems().forEach(subsystem -> {
            OntModel subsystemModel = buildAssetOntology(subsystem);
            ontModel.addSubModel(subsystemModel);
            OntClass subSystemClass = subsystemModel.getOntClass(URI_ASSET + subsystem.getId());
            assetClass.addProperty(AssetSchema.subsystems, subSystemClass);
        });

        asset.getFieldInstances().forEach(fieldInstance -> {
            DatatypeProperty fieldProperty = ontModel.createDatatypeProperty(
                    URI_ASSET + asset.getId() + "_" + fieldInstance.getFieldSource().getFieldTarget().getLabel());
            fieldProperty.addDomain(assetClass);
            if (fieldInstance.getFieldSource().getFieldTarget().getFieldType().equals(FieldType.ATTRIBUTE)
                    && fieldInstance.getValue() != null) {
                assetClass.addLiteral(fieldProperty, fieldInstance.getValue());
            } else {
                assetClass.addLiteral(fieldProperty, "");
            }
        });

        createPrefixMap(ontModel);
        return ontModel;
    }

    private void addRange(QuantityType quantityType, DatatypeProperty fieldProperty) {
        switch (quantityType.getDataType()) {
            case CATEGORICAL:
                fieldProperty.addRange(XSD.xstring);
                break;
            case NUMERIC:
                fieldProperty.addRange(XSD.xdouble);
                break;
            default:
                break;
        }
    }

    private void addField(OntModel ontModel, Field field, DatatypeProperty fieldProperty) {
        OntClass fieldClass = fieldModel.getOntClass(URI_FIELDS + field.getId());
        ontModel.add(fieldProperty, FieldSchema.hasField, fieldClass);
    }

    private void addUnit(OntModel ontModel, Unit unit, DatatypeProperty fieldProperty) {
        OntClass unitClass = unitModel.getOntClass(URI_UNITS + unit.getId());
        ontModel.add(fieldProperty, UnitSchema.hasUnit, unitClass);
    }

    private void createPrefixMap(OntModel ontModel) {
        HashMap<String, String> nsPrefix = new HashMap<>();
        nsPrefix.put("", URI);
        nsPrefix.put("field", URI_FIELDS);
        nsPrefix.put("unit", URI_UNITS);
        nsPrefix.put("quantityType", URI_QUANTITY_TYPE);
        nsPrefix.put("assetType", URI_AT);
        nsPrefix.put("assetTypeTemplate", URI_ATT);
        nsPrefix.put("assetSeries", URI_AS);
        nsPrefix.put("asset", URI_ASSET);
        nsPrefix.put("assetschema", AssetSchema.getUri());
        nsPrefix.put("asschema", AssetSeriesSchema.getUri());
        nsPrefix.put("attschema", AssetTypeTemplateSchema.getUri());
        nsPrefix.put("atschema", AssetTypeSchema.getUri());
        nsPrefix.put("fieldschema", FieldSchema.getUri());
        nsPrefix.put("unitschema", UnitSchema.getUri());
        nsPrefix.put("quantitytypeschema", QuantityTypeSchema.getUri());
        ontModel.setNsPrefixes(nsPrefix);
    }

    private OntClass generateFieldOntology(Field field, OntModel ontModel) {
        FieldSchema fieldSchema = new FieldSchema();
        OntClass fieldClass = ontModel.createClass(URI_FIELDS + field.getId());
        Optional.ofNullable(field.getThresholdType())
                .ifPresent(thresholdType ->
                        fieldClass.addProperty(FieldSchema.hasThresholdProperty,
                                fieldSchema.getThresholdTypeProperty(thresholdType)));
        fieldClass.addProperty(FieldSchema.accuracy, field.getAccuracy().toString());
        fieldClass.addProperty(FieldSchema.name, field.getName());
        fieldClass.addProperty(FieldSchema.description, field.getDescription());

        return fieldClass;
    }

    @NotNull
    private OntModel loadFieldModel() {
        final OntModel fieldModelLocal = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        this.fieldService.getAllFields().forEach(field -> generateFieldOntology(field, fieldModelLocal));
        return fieldModelLocal;
    }

    private OntClass generateUnitOntology(Unit unit, OntModel ontModel) {
        OntClass fieldClass = ontModel.createClass(URI_UNITS + unit.getId());
        fieldClass.addProperty(UnitSchema.name, unit.getName());
        fieldClass.addProperty(UnitSchema.label, unit.getLabel());
        fieldClass.addProperty(UnitSchema.symbol, unit.getSymbol());

        return fieldClass;
    }

    @NotNull
    private OntModel loadUnitModel() {
        final OntModel unitModelLocal = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        this.unitService.getAllUnits().forEach(unit -> generateUnitOntology(unit, unitModelLocal));
        return unitModelLocal;
    }

    private OntClass generateAssetTypeOntology(AssetType assetType, OntModel ontModel) {
        OntClass fieldClass = ontModel.createClass(URI_AT + assetType.getId());
        fieldClass.addProperty(AssetTypeSchema.name, assetType.getName());
        fieldClass.addProperty(AssetTypeSchema.label, assetType.getLabel());
        fieldClass.addProperty(AssetTypeSchema.description, assetType.getDescription());

        return fieldClass;
    }

    @NotNull
    private OntModel loadAssetTypeModel() {
        final OntModel assetTypeModelLocal = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        this.assetTypeService.getAllAssetTypes().forEach(assetType ->
                generateAssetTypeOntology(assetType, assetTypeModelLocal)
        );
        return assetTypeModelLocal;
    }

    private OntClass generateQuantityTypeOntology(QuantityType quantityType, OntModel ontModel) {
        QuantityTypeSchema quantityTypeSchema = new QuantityTypeSchema();
        OntClass fieldClass = ontModel.createClass(URI_QUANTITY_TYPE + quantityType.getId());
        fieldClass.addProperty(QuantityTypeSchema.name, quantityType.getName());
        fieldClass.addProperty(QuantityTypeSchema.label, quantityType.getLabel());
        fieldClass.addProperty(QuantityTypeSchema.description, quantityType.getDescription());
        fieldClass.addProperty(QuantityTypeSchema.dataType,
                quantityTypeSchema.getQuantityDataType(quantityType.getDataType()));
        quantityType.getUnits().stream()
                .map(unit -> unitModel.getOntClass(URI_UNITS + unit.getId()))
                .forEach(unit -> fieldClass.addProperty(QuantityTypeSchema.units, unit));
        return fieldClass;
    }

    @NotNull
    private OntModel loadQuantityTypeModel() {
        final OntModel quantityTypeModelLocal = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        this.quantityTypeService.getAllQuantityTypes().forEach(quantityType ->
                generateQuantityTypeOntology(quantityType, quantityTypeModelLocal));
        return quantityTypeModelLocal;
    }

    public OntModel buildEcosystemOntology() {
        OntModel ontModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        ontModel.addSubModel(fieldModel);
        ontModel.addSubModel(assetTypeModel);
        ontModel.addSubModel(quantityTypeModel);
        ontModel.addSubModel(unitModel);
        createPrefixMap(ontModel);
        return ontModel;
    }
}
