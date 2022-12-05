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

package io.fusion.fusionbackend.service.shacl;

import com.codepoetics.protonpack.StreamUtils;
import io.fusion.fusionbackend.config.ShaclConfig;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.ConnectivityProtocol;
import io.fusion.fusionbackend.model.ConnectivitySettings;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.model.enums.FieldDataType;
import io.fusion.fusionbackend.model.enums.FieldThresholdType;
import io.fusion.fusionbackend.model.enums.FieldType;
import io.fusion.fusionbackend.model.enums.FieldWidgetType;
import io.fusion.fusionbackend.model.shacl.NodeShape;
import io.fusion.fusionbackend.model.shacl.PropertyShape;
import io.fusion.fusionbackend.model.shacl.ShaclShape;
import io.fusion.fusionbackend.model.shacl.enums.BasicPaths;
import io.fusion.fusionbackend.model.shacl.enums.IfsPaths;
import io.fusion.fusionbackend.model.shacl.enums.NgsiLdPaths;
import io.fusion.fusionbackend.model.shacl.enums.ShaclNodeKind;
import io.fusion.fusionbackend.model.shacl.enums.ShaclPaths;
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
import io.fusion.fusionbackend.service.CompanyService;
import io.fusion.fusionbackend.service.ConnectivityTypeService;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.jena.graph.Node;
import org.apache.jena.graph.Node_Blank;
import org.apache.jena.graph.Node_URI;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.shared.SyntaxError;
import org.apache.jena.vocabulary.XSD;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class ShaclMapper {

    private final ShaclConfig shaclConfig;
    private final AssetTypeTemplateService assetTypeTemplateService;
    private final CompanyService companyService;
    private final ConnectivityTypeService connectivityTypeService;

    public ShaclMapper(ShaclConfig shaclConfig,
                       AssetTypeTemplateService assetTypeTemplateService,
                       CompanyService companyService,
                       ConnectivityTypeService connectivityTypeService
    ) {
        this.shaclConfig = shaclConfig;
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.companyService = companyService;
        this.connectivityTypeService = connectivityTypeService;
    }

    public NodeShape mapFromAsset(Asset asset) {
        return (NodeShape) mapFromAsset(asset, 1L, true);
    }

    public ShaclShape mapFromAsset(Asset asset, Long orderId, boolean isRootNodeShape) {
        String iri = ShaclHelper.createAssetIriWithSerial(asset, shaclConfig.getDefaultPrefix());
        return mapFromAsset(asset, isRootNodeShape
                ? new NodeShape(iri)
                : new PropertyShape(ShaclNodeKind.IRI, iri), iri, orderId);
    }

    private ShaclShape mapFromAsset(Asset asset, ShaclShape shape, String iri, Long orderId) {
        shape
                .addParameter(ShaclPaths.NAME, iri)
                .addParameter(ShaclPaths.ORDER, orderId)
                .addParameter(IfsPaths.FIELD_NAME, ShaclHelper.toValidText(asset.getExternalName()))
                .addParameter(IfsPaths.ASSET_SERIES_NAME,
                        ShaclHelper.createIriIfNeeded(asset.getAssetSeries().getName(),
                                shaclConfig.getDefaultPrefix()))
                .addSubShape(asExtraPropertyShape(IfsPaths.CONNECTION_STRING, XSD.xstring, 1L))
                .addSubShape(asExtraPropertyShape(IfsPaths.CONNECTIVITY_TYPE, XSD.xstring, 2L))
                .addSubShape(asExtraPropertyShape(IfsPaths.CONNECTIVITY_PROTOCOL, XSD.xstring, 3L))
                .addSubShape(asExtraPropertyShape(IfsPaths.PROTECTION_CLASS, XSD.xstring, 4L))
                .addSubShape(asExtraPropertyShape(IfsPaths.SERIAL_NUMBER, XSD.xstring, 5L))
                .addSubShape(asExtraPropertyShape(IfsPaths.ASSET_MANUAL, XSD.xstring, 6L))
                .addSubShape(asExtraPropertyShape(IfsPaths.ASSET_VIDEO, XSD.xstring, 7L))
                .addSubShape(asExtraPropertyShape(IfsPaths.CE_CERTIFICATION, XSD.xboolean, 8L))
                .addSubShape(asExtraPropertyShape(IfsPaths.CONSTRUCTION_DATE, XSD.date, 9L))
                .addSubShape(asExtraPropertyShape(IfsPaths.INSTALLATION_DATE, XSD.date, 10L));
        final int offset1 = shape.getSubShapes().size() + 1;
        shape.addSubShapes(
                StreamUtils.zipWithIndex(asset.getFieldInstances().stream())
                        .map(source -> mapFromAssetFieldSource(source.getValue().getFieldSource(),
                                source.getIndex() + offset1))
                        .collect(Collectors.toSet()));
        final int offset2 = shape.getSubShapes().size() + 1;
        shape.addSubShapes(StreamUtils.zipWithIndex(asset.getSubsystems().stream()
                .sorted(Comparator.comparing(Asset::getName)))
                .map(candidate -> this.mapFromAsset(candidate.getValue(), candidate.getIndex() + offset2, false))
                .collect(Collectors.toSet()));
        return shape;
    }

    private ShaclShape asPropertyShape(String path,
                                       Resource dataType,
                                       Optional<String> metricDataType,
                                       boolean mandatory,
                                       Long orderId) {


        PropertyShape shape = (PropertyShape) new PropertyShape(ShaclNodeKind.LITERAL, NgsiLdPaths.HAS_PATH.getPath())
                .addParameter(ShaclPaths.DATATYPE, dataType.getURI())
                .addParameter(ShaclPaths.MIN_COUNT, 1)
                .addParameter(ShaclPaths.MAX_COUNT, 1);
        metricDataType.ifPresent(mdt -> shape.addParameter(IfsPaths.METRIC_DATATYPE, mdt));
        return new PropertyShape(ShaclNodeKind.BLANK_NODE, path)
                .addParameter(ShaclPaths.MIN_COUNT, mandatory ? 1 : 0)
                .addParameter(ShaclPaths.MAX_COUNT, 1)
                .addParameter(ShaclPaths.ORDER, orderId)
                .addSubShape(shape);
    }

    private ShaclShape asExtraPropertyShape(BasicPaths path,
                                            Resource dataType,
                                            Long orderId) {
        return asPropertyShape(path.getPath(), dataType, Optional.empty(), true, orderId);
    }

    private ShaclShape mapFromAssetFieldSource(FieldSource fieldSource, Long orderId) {
        return asPropertyShape(
                ShaclHelper.createIriIfNeeded(fieldSource.getFieldTarget().getName(), shaclConfig.getDefaultPrefix()),
                XSD.xstring,
                Optional.of(fieldSource.getFieldTarget().getField().getDataType().getPath()),
                fieldSource.getFieldTarget().getMandatory(),
                orderId);
    }

    public NodeShape mapFromAssetTypeTemplate(AssetTypeTemplate assetTypeTemplate) {

        return (NodeShape) new NodeShape(ShaclHelper.createIriIfNeeded(assetTypeTemplate.getName(),
                shaclConfig.getDefaultPrefix()))
                .addParameter(ShaclPaths.NAME, ShaclHelper.toValidText(assetTypeTemplate.getName()))
                .addParameter(ShaclPaths.DESCRIPTION, ShaclHelper.toValidText(assetTypeTemplate.getDescription()))
                .addParameter(IfsPaths.VERSION, assetTypeTemplate.getVersion())
                .addParameter(IfsPaths.ASSET_TYPE_NAME,
                        ShaclHelper.toValidText(assetTypeTemplate.getAssetType().getName()))
                .addParameter(IfsPaths.ASSET_TYPE_LABEL,
                        ShaclHelper.toValidText(assetTypeTemplate.getAssetType().getLabel()))
                .addParameter(IfsPaths.ASSET_TYPE_VERSION, assetTypeTemplate.getAssetType().getVersion())
                .addSubShapes(mapFromAssetFieldTargets(assetTypeTemplate.getFieldTargets(), null));
    }

    public PropertyShape mapFromAssetFieldTarget(
            FieldTarget fieldTarget,
            Long orderId,
            ShaclHelper.LambdaWrapper<ShaclShape> executeAfter) {
        String iri = ShaclHelper.createIriIfNeeded(fieldTarget.getName(), shaclConfig.getDefaultPrefix());
        PropertyShape shape = (PropertyShape) new PropertyShape(ShaclNodeKind.LITERAL, NgsiLdPaths.HAS_PATH.getPath())
                .addParameter(ShaclPaths.NAME,
                        ShaclHelper.toValidText(fieldTarget.getName()))
                .addParameter(ShaclPaths.LABEL_TEMPLATE,
                        ShaclHelper.toValidText(fieldTarget.getLabel()))
                .addParameter(ShaclPaths.DESCRIPTION,
                        ShaclHelper.toValidText(fieldTarget.getDescription()))
                .addParameter(IfsPaths.FIELD_TYPE,
                        ShaclHelper.toValidText(fieldTarget.getFieldType().toString()))
                .addParameter(IfsPaths.FIELD_NAME,
                        ShaclHelper.toValidText(fieldTarget.getField().getName()))
                .addParameter(IfsPaths.FIELD_LABEL,
                        ShaclHelper.toValidText(fieldTarget.getField().getLabel()))
                .addParameter(IfsPaths.FIELD_DESCRIPTION,
                        ShaclHelper.toValidText(fieldTarget.getField().getDescription()))
                .addParameter(IfsPaths.FIELD_ACCURACY,
                        fieldTarget.getField().getAccuracy())
                .addParameter(ShaclPaths.DATATYPE,
                        fieldTarget.getField().getDataType().getPath())
                .addParameter(IfsPaths.FIELD_THRESHOLD_TYPE,
                        ShaclHelper.toValidText(fieldTarget.getField().getThresholdType().name()))
                .addParameter(IfsPaths.FIELD_UNIT,
                        ShaclHelper.toValidText(fieldTarget.getField().getUnit().getLabel()))
                .addParameter(IfsPaths.FIELD_WIDGET_TYPE,
                        ShaclHelper.toValidText(fieldTarget.getField().getWidgetType().name()))
                .addParameter(IfsPaths.FIELD_DASHBOARD_GROUP,
                        ShaclHelper.toValidText(fieldTarget.getDashboardGroup()))
                .addParameter(ShaclPaths.MIN_COUNT, 1)
                .addParameter(ShaclPaths.MAX_COUNT, 1);
        if (executeAfter != null) {
            executeAfter.execute(shape);
        }

        return (PropertyShape) new PropertyShape(ShaclNodeKind.BLANK_NODE, iri)
                .addParameter(ShaclPaths.MIN_COUNT,
                        fieldTarget.getMandatory() ? 1 : 0)
                .addParameter(ShaclPaths.MAX_COUNT,
                        fieldTarget.getField().getThresholdType().equals(FieldThresholdType.OPTIONAL)
                                && fieldTarget.getMandatory() ? 0 : 1)
                .addParameter(ShaclPaths.ORDER, orderId)
                .addSubShape(shape.addParameter(ShaclPaths.ORDER, 1));
    }

    public List<ShaclShape> mapFromAssetFieldTargets(Collection<FieldTarget> fieldTargets,
                                                     ShaclHelper.LambdaWrapper wrapper) {
        return StreamUtils.zipWithIndex(fieldTargets.stream()
                .sorted(Comparator.comparing(FieldTarget::getName)))
                .map(indexedFieldTarget -> mapFromAssetFieldTarget(
                        indexedFieldTarget.getValue(),
                        indexedFieldTarget.getIndex() + 1,
                        wrapper)
                )
                .collect(Collectors.toList());
    }

    public AssetTypeTemplate mapToAssetFieldTarget(ShaclShape shape) {
        AssetTypeTemplate att = assetTypeTemplateService.getAllAssetTypeTemplates().stream()
                .filter(candidate -> isRightAssetTypeTemplate(shape, candidate))
                .findAny()
                .orElseThrow(() -> new SyntaxError("Unknown asset type template" + findShapeIdentifier(shape)));
        validateAssetTypeTemplate(shape, att);
        return att;
    }

    public AssetSeries mapToAssetSeries(ShaclShape shape, Long companyId) {
        AssetSeries series = new AssetSeries();
        series.setAssetTypeTemplate(mapToAssetFieldTarget(shape));
        series.setName(shape.getStringParameter(IfsPaths.ASSET_SERIES_NAME, series.getAssetTypeTemplate().getName()));
        series.setDescription(shape.getStringParameter(IfsPaths.ASSET_SERIES_DESCRIPTION,
                series.getAssetTypeTemplate().getDescription()));
        series.setCeCertified(Boolean.parseBoolean(getParameterOrThrow(shape, IfsPaths.CE_CERTIFICATION)));
        series.setProtectionClass(getParameterOrThrow(shape, IfsPaths.PROTECTION_CLASS));
        series.setConnectivitySettings(findConnectivitySettings(shape));
        series.setCustomScript(shape.getStringParameter(IfsPaths.CUSTOM_SCRIPT, ""));
        series.setGlobalId(shape.getStringParameter(IfsPaths.GLOBAL_ID, UUID.randomUUID().toString()));
        series.setHandbookUrl(shape.getStringParameter(IfsPaths.ASSET_MANUAL, ""));
        series.setVideoUrl(shape.getStringParameter(IfsPaths.ASSET_VIDEO, ""));
        series.setCompany(companyService.getCompany(companyId, true));
        series.setFieldSources(mapToFieldSources(shape, series.getAssetTypeTemplate().getFieldTargets()));
        validateAllMandatoriesPresent(shape, series);

        return series;
    }

    private void validateAllMandatoriesPresent(ShaclShape shape, AssetSeries series) {
        series.getAssetTypeTemplate().getFieldTargets().stream()
                .filter(FieldTarget::getMandatory)
                .map(mandatory -> getFieldInShapeOrThrow(mandatory, shape))
                .forEach(candidate -> getParameterOrThrow(candidate, IfsPaths.REGISTER));
    }

    private ShaclShape getFieldInShapeOrThrow(FieldTarget mandatory, ShaclShape shape) {
        return flatPropertyShapeStream(shape)
                .filter(candidate -> validateParameter(candidate, ShaclPaths.LABEL_TEMPLATE, mandatory.getLabel()))
                .findAny()
                .orElseThrow(() -> new SyntaxError("Missing mandatory field "
                        + findFieldTargetIdentifier(mandatory)
                        + " in "
                        + findShapeIdentifier(shape)));
    }

    private void addPropertiesRecursive(Stream.Builder<PropertyShape> streamBuilder, Collection<ShaclShape> shape) {
        shape.forEach(candidate -> {
            switch (ShaclNodeKind
                    .asEnum(getParameterOrThrow(candidate, ShaclPaths.NODE_KIND))
                    .orElse(ShaclNodeKind.UNSET)) {
                case BLANK_NODE:
                    addPropertiesRecursive(streamBuilder, candidate.getSubShapes());
                    break;
                case LITERAL:
                    if (candidate instanceof PropertyShape) {
                        streamBuilder.add((PropertyShape) candidate);
                    }
                    break;
                default:
            }
        });
    }

    private Stream<PropertyShape> flatPropertyShapeStream(ShaclShape shape) {
        Stream.Builder<PropertyShape> stream = Stream.builder();
        addPropertiesRecursive(stream, shape.getSubShapes());
        return stream.build();
    }

    private Set<FieldSource> mapToFieldSources(ShaclShape shape, Collection<FieldTarget> fieldTargets) {
        return flatPropertyShapeStream(shape)
                .map(candidate -> mapToFieldSource(candidate, fieldTargets))
                .collect(Collectors.toSet());
    }

    private FieldSource mapToFieldSource(ShaclShape shape, Collection<FieldTarget> fieldTargets) {
        FieldTarget target = findFieldTargetOrThrow(shape, fieldTargets);
        FieldSource source = FieldSource.builder()
                .fieldTarget(target)
                .name(target.getName())
                .sourceUnit(target.getField().getUnit())
                .description(target.getDescription())
                .globalId(UUID.randomUUID().toString())
                .build();
        Optional.ofNullable(shape.getStringParameter(IfsPaths.REGISTER)).ifPresent(source::setRegister);
        Optional.ofNullable(shape.getStringParameter(ShaclPaths.VALUE)).ifPresent(source::setValue);
        return source;
    }

    private ConnectivitySettings findConnectivitySettings(ShaclShape shape) {
        String typeString = getParameterOrThrow(shape, IfsPaths.CONNECTIVITY_TYPE);
        String protocolString = getParameterOrThrow(shape, IfsPaths.CONNECTIVITY_PROTOCOL);
        ConnectivitySettings connectivitySettings = new ConnectivitySettings();
        connectivitySettings.setConnectionString(shape.getStringParameter(IfsPaths.CONNECTION_STRING, ""));
        connectivitySettings.setConnectivityType(
                connectivityTypeService.getAll().stream()
                        .filter(type -> type.getName().equalsIgnoreCase(typeString))
                        .filter(type -> type.getAvailableProtocols().stream()
                                .map(ConnectivityProtocol::getName)
                                .anyMatch(candidate -> candidate.equalsIgnoreCase(protocolString)))
                        .findAny()
                        .orElseThrow(() -> new SyntaxError("Invalid connectivity type/protocol combination in "
                                + this.findShapeIdentifier(shape)))
        );
        connectivitySettings.getConnectivityType().getAvailableProtocols().stream()
                .filter(candidate -> candidate.getName()
                        .equalsIgnoreCase(protocolString))
                .findAny()
                .ifPresent(connectivitySettings::setConnectivityProtocol);
        return connectivitySettings;
    }

    private boolean isRightAssetTypeTemplate(ShaclShape shape, AssetTypeTemplate assetTypeTemplate) {
        return validateParameter(shape, ShaclPaths.NAME, assetTypeTemplate.getName())
                && validateParameter(shape, IfsPaths.VERSION, assetTypeTemplate.getVersion());
    }

    private void validateAssetTypeTemplate(ShaclShape shape, AssetTypeTemplate candidate) {
        validateAssetType(shape, candidate.getAssetType());
        validateFieldTargets(shape, candidate.getFieldTargets());
    }

    private void validateFieldTargets(ShaclShape shape, Collection<FieldTarget> fieldTargets) {
        flatPropertyShapeStream(shape).forEach(candidate -> validateFieldTarget(candidate, fieldTargets));
    }

    private FieldTarget findFieldTargetOrThrow(ShaclShape shape, Collection<FieldTarget> fieldTargets) {
        return fieldTargets.stream()
                .filter(candidate -> validateParameter(shape, ShaclPaths.LABEL_TEMPLATE, candidate.getLabel()))
                .findAny()
                .orElseThrow(() -> new SyntaxError("Missing or inconsistent field target "
                        + findShapeIdentifier(shape)));
    }

    private void validateFieldTarget(ShaclShape shape, Collection<FieldTarget> fieldTargets) {
        FieldTarget fieldTarget = findFieldTargetOrThrow(shape, fieldTargets);
        validateField(shape, fieldTarget.getField());
        validateFieldType(shape, fieldTarget.getFieldType());
        if (fieldTarget.getMandatory()) {
            getParameterOrThrow(shape, IfsPaths.REGISTER);
        }
    }

    private void validateField(ShaclShape shape, Field field) {
        validateParameter(shape, IfsPaths.FIELD_LABEL, field.getLabel());
        validateParameter(shape, IfsPaths.FIELD_LABEL, field.getName());
        validateParameter(shape, IfsPaths.FIELD_DESCRIPTION, field.getDescription());
        validateParameter(shape, IfsPaths.FIELD_ACCURACY, field.getAccuracy());
        validateDataType(shape, field.getDataType());
        validateThresholdType(shape, field.getThresholdType());
        validateUnit(shape, field.getUnit());
        validateWidgetType(shape, field.getWidgetType());
    }

    private boolean validateFieldType(ShaclShape shape, FieldType fieldType) {
        return validateParameter(shape, IfsPaths.FIELD_TYPE, fieldType.name());
    }

    private boolean validateWidgetType(ShaclShape shape, FieldWidgetType widgetType) {
        return validateParameter(shape, IfsPaths.FIELD_WIDGET_TYPE, widgetType.name());
    }

    private boolean validateUnit(ShaclShape shape, Unit unit) {
        return validateParameter(shape, IfsPaths.FIELD_UNIT, unit.getLabel());
    }

    private boolean validateThresholdType(ShaclShape shape, FieldThresholdType thresholdType) {
        return validateParameter(shape, IfsPaths.FIELD_THRESHOLD_TYPE, thresholdType.name());
    }

    private void validateDataType(ShaclShape shape, FieldDataType dataType) {
        validateParameterOrThrow(shape, ShaclPaths.DATATYPE, dataType.getPath());
    }

    private void validateAssetType(ShaclShape shape, AssetType assetType) {
        validateParameterOrThrow(shape, IfsPaths.ASSET_TYPE_LABEL, assetType.getLabel());
        validateParameterOrThrow(shape, IfsPaths.ASSET_TYPE_VERSION, assetType.getVersion());
        validateParameterOrThrow(shape, IfsPaths.ASSET_TYPE_NAME, assetType.getName());
    }

    private boolean validateParameter(ShaclShape shape, BasicPaths path, String candidate) {
        return getParameterOrThrow(shape, path).equalsIgnoreCase(candidate);
    }

    private boolean validateParameter(ShaclShape shape, BasicPaths path, Long candidate) {
        return Long.parseLong(getParameterOrThrow(shape, path)) == candidate;
    }

    private boolean validateParameter(ShaclShape shape, BasicPaths path, Double candidate) {
        return Double.parseDouble(getParameterOrThrow(shape, path)) == candidate;
    }

    private void validateParameterOrThrow(ShaclShape shape, BasicPaths path, String candidate) {
        if (!validateParameter(shape, path, candidate)) {
            throw new SyntaxError("Inconsistent "
                    + path.getPath() + " property in " + findShapeIdentifier(shape));
        }
    }

    private void validateParameterOrThrow(ShaclShape shape, BasicPaths path, Long candidate) {
        if (!validateParameter(shape, path, candidate)) {
            throw new SyntaxError("Inconsistent "
                    + path.getPath() + " property in " + findShapeIdentifier(shape));
        }
    }

    private void validateParameterOrThrow(ShaclShape shape, BasicPaths path, Double candidate) {
        if (!validateParameter(shape, path, candidate)) {
            throw new SyntaxError("Inconsistent "
                    + path.getPath() + " property in " + findShapeIdentifier(shape));
        }
    }

    private String getParameterOrThrow(ShaclShape shape, BasicPaths path) {
        return Optional.ofNullable(shape.getStringParameter(path, null))
                .orElseThrow(() -> new SyntaxError("Missing "
                        + path.getPath() + " property in " + findShapeIdentifier(shape))
                );
    }

    private String findFieldTargetIdentifier(FieldTarget fieldTarget) {
        return fieldTarget.getLabel() != null && !fieldTarget.getLabel().isEmpty()
                ? fieldTarget.getLabel()
                : fieldTarget.getName();
    }

    private String findShapeIdentifier(ShaclShape shape) {
        return shape.getStringParameter(ShaclPaths.LABEL_TEMPLATE,
                shape.getStringParameter(ShaclPaths.NAME,
                        shape.getStringParameter(ShaclPaths.DESCRIPTION,
                                "unnamed shape"
                        )
                )
        );
    }


    public static ShaclShape nodeToShaclShape(ShaclFactory.ShaclFactoryTreeNode node) {
        ShaclShape shape = createShaclShapeByNodeKind(
                node.getSubject(),
                toNodeKind(node.getAttribute(ShaclPaths.NODE_KIND))
        );
        node.getAttributes().forEach((predicate, obj) -> ShaclMapper.addParameter(shape, predicate, obj));
        node.getProperties().stream()
                .map(ShaclMapper::nodeToShaclShape)
                .forEach(shape::addSubShape);
        return shape;
    }

    private static void addParameter(ShaclShape shape, BasicPaths predicate, Node obj) {
        if (obj.isURI()) {
            shape.addParameter(predicate, obj.getURI());
        } else if (obj.isLiteral()) {
            if (Boolean.class.equals(obj.getLiteralDatatype().getJavaClass())) {
                shape.addParameter(predicate, Boolean.parseBoolean(obj.getLiteralValue().toString()));
            } else if (BigInteger.class.equals(obj.getLiteralDatatype().getJavaClass())) {
                shape.addParameter(predicate, Integer.parseInt(obj.getLiteralValue().toString()));
            } else if (BigDecimal.class.equals(obj.getLiteralDatatype().getJavaClass())) {
                shape.addParameter(predicate, Double.parseDouble(obj.getLiteralValue().toString()));
            } else if (String.class.equals(obj.getLiteralDatatype().getJavaClass())) {
                shape.addParameter(predicate, '"' + obj.getLiteralValue().toString() + '"');
            } else {
                shape.addParameter(predicate, obj.getLiteralValue().toString());
            }
        }
    }

    private static ShaclNodeKind toNodeKind(Optional<Node> node) {
        return node.map(n -> ShaclNodeKind.asEnum(n.getURI())
                .orElseThrow(() -> new SyntaxError("Unknown or unsupported nodeKind '" + n.getURI() + "'")))
                .orElse(ShaclNodeKind.UNSET);
    }

    //Node_Blank, Node_Anon, Node_URI, Node_Variable, and Node_ANY
    private static ShaclShape createShaclShapeByNodeKind(Node node, ShaclNodeKind nodeKind) {
        if (nodeInstanceOf(node, Node_URI.class)) {
            return new NodeShape(node.getURI());
        } else if (nodeInstanceOf(node, Node_Blank.class)) {
            return new PropertyShape(ShaclNodeKind.BLANK_NODE, node.getBlankNodeLabel());
        }
        switch (nodeKind) {
            case IRI:
            case UNSET:
                return new NodeShape(node.getURI());
            case BLANK_NODE:
                return new PropertyShape(nodeKind, null);
            case LITERAL:
                return new PropertyShape(nodeKind, node.getURI());
            default:
                throw new NotImplementedException("Unsupported nodeKind '" + nodeKind.getPath() + "'");
        }
    }

    @SafeVarargs
    private static boolean nodeInstanceOf(Node node, Class<? extends Node>... valid) {
        return Arrays.asList(valid).contains(node.getClass());
    }

}
