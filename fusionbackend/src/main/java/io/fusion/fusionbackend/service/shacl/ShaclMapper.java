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
//CHECKSTYLE:OFF
// CHECKSTYLE IGNORE check FOR NEXT 1 LINES
//CHECKSTYLE:ON
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.AssetTypeTemplatePeer;
import io.fusion.fusionbackend.model.ConnectivitySettings;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldOption;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.model.QuantityType;
import io.fusion.fusionbackend.model.Threshold;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.model.enums.FieldDataType;
import io.fusion.fusionbackend.model.enums.FieldThresholdType;
import io.fusion.fusionbackend.model.enums.FieldType;
import io.fusion.fusionbackend.model.enums.FieldWidgetType;
import io.fusion.fusionbackend.model.enums.PublicationState;
import io.fusion.fusionbackend.model.enums.QuantityDataType;
import io.fusion.fusionbackend.model.shacl.NodeShape;
import io.fusion.fusionbackend.model.shacl.PropertyShape;
import io.fusion.fusionbackend.model.shacl.RelationshipShape;
import io.fusion.fusionbackend.model.shacl.ShaclShape;
import io.fusion.fusionbackend.model.shacl.enums.AssetTypeKeys;
import io.fusion.fusionbackend.model.shacl.enums.BasicKeys;
import io.fusion.fusionbackend.model.shacl.enums.FieldKeys;
import io.fusion.fusionbackend.model.shacl.enums.IfsKeys;
import io.fusion.fusionbackend.model.shacl.enums.NameSpaces;
import io.fusion.fusionbackend.model.shacl.enums.NgsiLdKeys;
import io.fusion.fusionbackend.model.shacl.enums.QuantityTypeKeys;
import io.fusion.fusionbackend.model.shacl.enums.ShaclKeys;
import io.fusion.fusionbackend.model.shacl.enums.ShaclNodeKind;
import io.fusion.fusionbackend.model.shacl.enums.UnitKeys;
import io.fusion.fusionbackend.service.AssetSeriesService;
import io.fusion.fusionbackend.service.AssetTypeService;
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
import io.fusion.fusionbackend.service.CompanyService;
import io.fusion.fusionbackend.service.ConnectivityTypeService;
import io.fusion.fusionbackend.service.FieldService;
import io.fusion.fusionbackend.service.FieldTargetService;
import io.fusion.fusionbackend.service.UnitService;
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
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ShaclMapper {

    private final AssetTypeTemplateService assetTypeTemplateService;
    private final AssetTypeService assetTypeService;
    private final FieldTargetService fieldTargetService;
    private final FieldService fieldService;
    private final CompanyService companyService;
    private final ConnectivityTypeService connectivityTypeService;
    private final UnitService unitService;
    private final AssetSeriesService assetSeriesService;

    public ShaclMapper(AssetTypeTemplateService assetTypeTemplateService,
                       AssetTypeService assetTypeService,
                       FieldTargetService fieldTargetService,
                       FieldService fieldService,
                       CompanyService companyService,
                       ConnectivityTypeService connectivityTypeService,
                       UnitService unitService,
                       AssetSeriesService assetSeriesService) {
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.assetTypeService = assetTypeService;
        this.fieldTargetService = fieldTargetService;
        this.fieldService = fieldService;
        this.companyService = companyService;
        this.connectivityTypeService = connectivityTypeService;
        this.unitService = unitService;
        this.assetSeriesService = assetSeriesService;
    }

    private ConnectivitySettings extractConnectivitySettings(ShaclShape shape) {
        final String ct = getFromExtraPropertyShape(shape, IfsKeys.CONNECTIVITY_TYPE);
        final String cp = getFromExtraPropertyShape(shape, IfsKeys.CONNECTIVITY_PROTOCOL);
        ConnectivitySettings cs = new ConnectivitySettings();
        cs.setConnectionString(getFromExtraPropertyShape(shape, IfsKeys.CONNECTION_STRING));
        cs.setConnectivityType(
                connectivityTypeService.getAll().stream()
                        .filter(t -> t.getName().equalsIgnoreCase(ct))
                        .findAny()
                        .orElseThrow(() -> new SyntaxError("Unknown connectivityType " + ct)));
        cs.setConnectivityProtocol(cs.getConnectivityType().getAvailableProtocols().stream()
                .filter(p -> p.getName().equalsIgnoreCase(cp))
                .findAny()
                .orElseThrow(() -> new SyntaxError("Unknown protocol " + cp)));
        return cs;
    }

    private String getFromExtraPropertyShape(ShaclShape shape, BasicKeys path) {
        return shape.getSubShapes().stream()
                .filter(sub -> getParameterOrThrow(sub, ShaclKeys.PATH).equalsIgnoreCase(path.getPath()))
                .map(s -> s.getSubShapes().stream().findAny()
                        .orElseThrow(() -> new SyntaxError("Missing sub shape in " + path.getPath())))
                .map(sub -> sub.getStringParameter(IfsKeys.DEFAULT, ""))
                .findAny()
                .orElseThrow(() -> new SyntaxError("Missing or invalid property " + path.getPath() + " in "
                        + findShapeIdentifier(shape))
                );
    }


    public ShaclShape mapFromAssetSeries(AssetSeries assetSeries) {
        String iri = ShaclHelper.createIriIfNeeded(assetSeries.getName());
        ShaclShape shape = new NodeShape(iri);
        shape.addParameter(ShaclKeys.NAME, ShaclHelper.toValidText(assetSeries.getName()))
                .addParameter(IfsKeys.VERSION, assetSeries.getVersion())
                .addParameter(IfsKeys.ASSET_TYPE_TEMPLATE,
                        ShaclHelper.createIriIfNeeded(assetSeries.getAssetTypeTemplate().getName()))
                .addParameter(ShaclKeys.DESCRIPTION, ShaclHelper.toValidText(assetSeries.getDescription()))
                .addSubShape(asExtraPropertyShape(IfsKeys.CONNECTION_STRING, XSD.xstring,
                        assetSeries.getConnectivitySettings().getConnectionString(), 1L))
                .addSubShape(asExtraPropertyShape(IfsKeys.CONNECTIVITY_TYPE, XSD.xstring,
                        assetSeries.getConnectivitySettings().getConnectivityType().getName().toString(), 2L))
                .addSubShape(asExtraPropertyShape(IfsKeys.CONNECTIVITY_PROTOCOL, XSD.xstring,
                        assetSeries.getConnectivitySettings().getConnectivityProtocol().getName().toString(), 3L))
                .addSubShape(asExtraPropertyShape(IfsKeys.PROTECTION_CLASS, XSD.xstring,
                        assetSeries.getProtectionClass(), 4L))
                .addSubShape(asExtraPropertyShape(IfsKeys.SERIAL_NUMBER, XSD.xstring, null, 5L))
                .addSubShape(asExtraPropertyShape(IfsKeys.ASSET_MANUAL, XSD.xstring,
                        assetSeries.getHandbookUrl(), 6L))
                .addSubShape(asExtraPropertyShape(IfsKeys.ASSET_VIDEO, XSD.xstring,
                        assetSeries.getVideoUrl(), 7L))
                .addSubShape(asExtraPropertyShape(IfsKeys.CUSTOM_SCRIPT, XSD.xstring,
                        assetSeries.getCustomScript(), 7L))
                .addSubShape(asExtraPropertyShape(IfsKeys.CE_CERTIFICATION, XSD.xboolean,
                        Boolean.toString(assetSeries.getCeCertified()), 8L))
                .addSubShape(asExtraPropertyShape(IfsKeys.IMAGE_KEY, XSD.xstring,
                        assetSeries.getImageKey(), 9L))
                .addSubShape(asExtraPropertyShape(IfsKeys.CONSTRUCTION_DATE, XSD.date, null, 9L))
                .addSubShape(asExtraPropertyShape(IfsKeys.INSTALLATION_DATE, XSD.date, null, 10L));
        final int offset = shape.getSubShapes().size() + 1;
        shape.addSubShapes(
                StreamUtils.zipWithIndex(assetSeries.getFieldSources().stream())
                        .map(source -> mapFromAssetFieldSource(source.getValue(), source.getIndex() + offset))
                        .collect(Collectors.toSet()));
        return shape;
    }

    private ShaclShape asPropertyShape(String path,
                                       Resource dataType,
                                       Optional<String> metricDataType,
                                       Optional<String> defaultValue,
                                       Optional<String> defaultRegister,
                                       boolean mandatory,
                                       Long orderId) {


        PropertyShape shape = (PropertyShape) new PropertyShape(ShaclNodeKind.LITERAL, NgsiLdKeys.HAS_PATH.getPath())
                .addParameter(ShaclKeys.DATATYPE, dataType.getURI())
                .addParameter(ShaclKeys.MIN_COUNT, 1)
                .addParameter(ShaclKeys.MAX_COUNT, 1);
        metricDataType.ifPresent(mdt -> shape.addParameter(IfsKeys.METRIC_DATATYPE, mdt));
        defaultValue.ifPresent(dv -> shape.addParameter(IfsKeys.DEFAULT, ShaclHelper.toValidText(dv)));
        defaultRegister.ifPresent(dv -> shape.addParameter(IfsKeys.REGISTER, ShaclHelper.toValidText(dv)));
        return new PropertyShape(ShaclNodeKind.BLANK_NODE, path)
                .addParameter(ShaclKeys.MIN_COUNT, mandatory ? 1 : 0)
                .addParameter(ShaclKeys.MAX_COUNT, 1)
                .addParameter(ShaclKeys.ORDER, orderId)
                .addSubShape(shape);
    }

    private ShaclShape asExtraPropertyShape(BasicKeys path,
                                            Resource dataType,
                                            String defaultValue,
                                            Long orderId) {
        return asPropertyShape(path.getPath(),
                dataType,
                Optional.empty(),
                Optional.ofNullable(defaultValue),
                Optional.empty(),
                true,
                orderId);
    }

    private ShaclShape mapFromAssetFieldSource(FieldSource fieldSource, Long orderId) {
        return asPropertyShape(
                ShaclHelper.createIriIfNeeded(fieldSource.getFieldTarget().getName()),
                XSD.xstring,
                Optional.of(fieldSource.getFieldTarget().getField().getDataType().getPath()),
                Optional.ofNullable(fieldSource.getValue()),
                Optional.ofNullable(fieldSource.getRegister()),
                fieldSource.getFieldTarget().getMandatory(),
                orderId);
    }

    public ShaclShape mapFromAssetTypeTemplate(AssetTypeTemplate assetTypeTemplate) {

        return new NodeShape(ShaclHelper.createIriIfNeeded(assetTypeTemplate.getAssetType().getName()))
                .addParameter(ShaclKeys.NAME, ShaclHelper.toValidText(assetTypeTemplate.getName()))
                .addParameter(ShaclKeys.DESCRIPTION, ShaclHelper.toValidText(assetTypeTemplate.getDescription()))
                .addParameter(IfsKeys.VERSION, assetTypeTemplate.getVersion())
                .addParameter(IfsKeys.CREATION_DATE, ShaclHelper.toValidText(assetTypeTemplate
                        .getCreationDate().toString()))
                .addParameter(IfsKeys.PUBLICATION_STATE, ShaclHelper.toValidText(assetTypeTemplate
                        .getPublicationState().name()))
                .addParameter(IfsKeys.PUBLISHED_VERSION, ShaclHelper.toValidText(assetTypeTemplate
                        .getPublishedVersion().toString()))
                .addParameter(IfsKeys.PUBLISHED_DATE, ShaclHelper.toValidText(assetTypeTemplate
                        .getPublishedDate().toString()))
                .addParameter(IfsKeys.ASSET_TYPE,
                        ShaclHelper.createIriIfNeeded(assetTypeTemplate.getAssetType().getName()))
                .addSubShapes(mapFromAssetFieldTargets(assetTypeTemplate.getFieldTargets(), null))
                .addSubShapes(mapFromAssetPeers(assetTypeTemplate.getPeers(), null));
    }

    public Set<ShaclShape> mapFromAssetTypeTemplates(Set<AssetTypeTemplate> assetTypeTemplates) {
        Set<Long> ids = new HashSet<>();
        return assetTypeTemplates.stream()
                .filter(a -> !ids.contains(a.getId()))
                .peek(a -> ids.add(a.getId()))
                .map(this::mapFromAssetTypeTemplate)
                .collect(Collectors.toSet());
    }

    public Set<ShaclShape> mapFromAssetTypes(Set<AssetType> assetTypes) {
        Set<Long> ids = new HashSet<>();
        return assetTypes.stream()
                .filter(a -> !ids.contains(a.getId()))
                .peek(a -> ids.add(a.getId()))
                .map(this::mapFromAssetType)
                .collect(Collectors.toSet());
    }

    private ShaclShape mapFromAssetType(AssetType assetType) {
        return new NodeShape(ShaclHelper.createAssetTypeIri(assetType))
                .addParameter(ShaclKeys.NAME, ShaclHelper.toValidText(assetType.getName()))
                .addParameter(AssetTypeKeys.NAME, ShaclHelper.toValidText(assetType.getName()))
                .addParameter(AssetTypeKeys.VERSION, assetType.getVersion())
                .addParameter(AssetTypeKeys.LABEL, ShaclHelper.toValidText(assetType.getLabel()))
                .addParameter(AssetTypeKeys.DESCRIPTION, ShaclHelper.toValidText(assetType.getDescription()));
    }

    private Set<Unit> getUnitsRecursive(Unit unit) {
        return getUnitsRecursive(unit, new HashSet<>());
    }

    private Set<Unit> getUnitsRecursive(Unit unit, Set<Long> addedIds) {
        if (addedIds.contains(unit.getId())) {
            throw new SyntaxError("Endless base unit loop in unit " + unit.getName());
        }
        Set<Unit> units = new HashSet<>();
        units.add(unit);
        if (unit.getQuantityType().getBaseUnit() != null) {
            units.addAll(getUnitsRecursive(unit.getQuantityType().getBaseUnit()));
        }
        return units;
    }

    public Set<ShaclShape> mapFromUnits(Set<Unit> units) {
        Set<Long> ids = new HashSet<>();
        return units.stream()
                .map(this::getUnitsRecursive)
                .flatMap(Collection::stream)
                .filter(u -> !ids.contains(u.getId()))
                .peek(u -> ids.add(u.getId()))
                .map(this::mapFromUnit)
                .collect(Collectors.toSet());
    }

    private ShaclShape mapFromUnit(Unit unit) {
        return new NodeShape(ShaclHelper.createUnitIri(unit))
                .addParameter(ShaclKeys.NAME, ShaclHelper.toValidText(unit.getName()))
                .addParameter(UnitKeys.NAME, ShaclHelper.toValidText(unit.getName()))
                .addParameter(UnitKeys.LABEL, ShaclHelper.toValidText(unit.getLabel()))
                .addParameter(UnitKeys.SYMBOL, ShaclHelper.toValidText(unit.getSymbol()))
                .addParameter(UnitKeys.VERSION, unit.getVersion())
                .addParameter(UnitKeys.CREATION_DATE,
                        ShaclHelper.toValidText(unit.getCreationDate().toString()))
                .addParameter(QuantityTypeKeys.NAME,
                        ShaclHelper.toValidText(unit.getQuantityType().getName()))
                .addParameter(QuantityTypeKeys.LABEL,
                        ShaclHelper.toValidText(unit.getQuantityType().getLabel()))
                .addParameter(QuantityTypeKeys.DESCRIPTION,
                        ShaclHelper.toValidText(unit.getQuantityType()
                                .getDescription()))
                .addParameter(QuantityTypeKeys.VERSION, unit.getQuantityType().getVersion())
                .addParameter(QuantityTypeKeys.DATATYPE,
                        ShaclHelper.toValidText(unit.getQuantityType().getDataType().name()))
                .addParameter(QuantityTypeKeys.BASE_UNIT,
                        Optional.ofNullable(unit.getQuantityType().getBaseUnit())
                                .map(ShaclHelper::createUnitIri)
                                .orElse(null));
    }

    public Set<ShaclShape> mapFromFields(Set<Field> fields) {
        Set<Long> ids = new HashSet<>();
        return fields.stream()
                .filter(f -> !ids.contains(f.getId()))
                .peek(f -> ids.add(f.getId()))
                .map(this::mapFromField)
                .collect(Collectors.toSet());
    }

    private ShaclShape mapFromField(Field field) {
        return new NodeShape(ShaclHelper.createFieldIri(field))
                .addParameter(ShaclKeys.NAME, ShaclHelper.toValidText(field.getName()))
                .addParameter(FieldKeys.NAME, ShaclHelper.toValidText(field.getName()))
                .addParameter(FieldKeys.VERSION, field.getVersion())
                .addParameter(FieldKeys.LABEL, ShaclHelper.toValidText(field.getLabel()))
                .addParameter(FieldKeys.DESCRIPTION, ShaclHelper.toValidText(field.getDescription()))
                .addParameter(FieldKeys.CREATION_DATE, ShaclHelper.toValidText(field.getCreationDate().toString()))
                .addParameter(FieldKeys.ACCURARCY, ShaclHelper.toValidText(field.getAccuracy().toString()))
                .addSubShapes(toFieldOptions(field.getOptions()))
                .addParameter(FieldKeys.WIDGET_TYPE, ShaclHelper.toValidText(
                        Optional.ofNullable(field.getWidgetType()).map(FieldWidgetType::name).orElse(null)))
                .addParameter(FieldKeys.UNIT,
                        Optional.ofNullable(field.getUnit()).map(ShaclHelper::createUnitIri).orElse(null))
                .addParameter(FieldKeys.THRESHOLD_TYPE,
                        ShaclHelper.toValidText(
                                Optional.ofNullable(field.getThresholdType())
                                        .map(FieldThresholdType::name).orElse(null)))
                .addParameter(ShaclKeys.DATATYPE, ShaclHelper.toValidText(field.getDataType().getPath()));
    }

    private Set<ShaclShape> toFieldOptions(Set<FieldOption> options) {
        return options.stream().map(o ->
                new PropertyShape(ShaclNodeKind.LITERAL,
                        NameSpaces.FIELD.getPath() + o.getLabel())
                        .addParameter(ShaclKeys.NAME, ShaclHelper.toValidText(o.getLabel())))
                .collect(Collectors.toSet());
    }

    public PropertyShape mapFromAssetFieldTarget(
            FieldTarget fieldTarget,
            Long orderId,
            ShaclHelper.LambdaWrapper<ShaclShape> executeAfter) {
        final String iri = ShaclHelper.createClassIri(fieldTarget.getName());

        PropertyShape shape = (PropertyShape) new PropertyShape(ShaclNodeKind.LITERAL, NgsiLdKeys.HAS_PATH.getPath())
                .addParameter(IfsKeys.FIELD, ShaclHelper.createFieldIri(fieldTarget.getField()))
                .addParameter(IfsKeys.FIELD_TYPE,
                        ShaclHelper.toValidText(fieldTarget.getFieldType().toString()))
                .addParameter(IfsKeys.FIELD_DASHBOARD_GROUP,
                        ShaclHelper.toValidText(fieldTarget.getDashboardGroup()));
        shape.addParameter(ShaclKeys.MIN_COUNT, 1)
                .addParameter(ShaclKeys.MAX_COUNT, 1);
        if (executeAfter != null) {
            executeAfter.execute(shape);
        }

        return (PropertyShape) new PropertyShape(ShaclNodeKind.BLANK_NODE, iri)
                .addParameter(ShaclKeys.MIN_COUNT,
                        fieldTarget.getMandatory() ? 1 : 0)
                .addParameter(ShaclKeys.MAX_COUNT,
                        fieldTarget.getField().getThresholdType().equals(FieldThresholdType.OPTIONAL)
                                && fieldTarget.getMandatory() ? 0 : 1)
                .addParameter(ShaclKeys.ORDER, orderId)
                .addSubShape(shape.addParameter(ShaclKeys.ORDER, 1));
    }


    public RelationshipShape mapFromAssetPeer(
            AssetTypeTemplatePeer attp,
            Long orderId,
            ShaclHelper.LambdaWrapper<ShaclShape> executeAfter) {
        final String iri = ShaclHelper.createHasClassIri(attp.getPeer().getAssetType().getName());

        RelationshipShape shape = (RelationshipShape) new RelationshipShape(ShaclNodeKind.IRI,
                NgsiLdKeys.HAS_RELATIONSHIP.getPath());
        shape.addParameter(ShaclKeys.MIN_COUNT, 1)
                .addParameter(ShaclKeys.MAX_COUNT, 1);
        shape.addParameter(ShaclKeys.CLASS, ShaclHelper.createClassIri(attp.getPeer().getAssetType().getName()));
        if (executeAfter != null) {
            executeAfter.execute(shape);
        }

        return (RelationshipShape) new RelationshipShape(ShaclNodeKind.BLANK_NODE, iri)
                .addParameter(ShaclKeys.MIN_COUNT,
                        attp.getMandatory() ? 1 : 0)
                .addParameter(ShaclKeys.MAX_COUNT, 1)
                .addParameter(ShaclKeys.ORDER, orderId)
                .addSubShape(shape.addParameter(ShaclKeys.ORDER, 1));
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

    public List<ShaclShape> mapFromAssetPeers(Collection<AssetTypeTemplatePeer> peers,
                                              ShaclHelper.LambdaWrapper wrapper) {
        return StreamUtils.zipWithIndex(peers.stream()
                .sorted(Comparator.comparing(AssetTypeTemplatePeer::getId)))
                .map(indexedPeer -> mapFromAssetPeer(
                        indexedPeer.getValue(),
                        1000000L + indexedPeer.getValue().getId(), wrapper)
                )
                .collect(Collectors.toList());
    }

    private int sortByOrderId(ShaclShape a, ShaclShape b) {
        return a.getIntParameter(ShaclKeys.ORDER, 0)
                .compareTo(b.getIntParameter(ShaclKeys.ORDER, 0));
    }

    private boolean isSubShape(ShaclShape shape) {
        return !isPropertyShape(shape);
    }

    private boolean isPropertyShape(ShaclShape shape) {
        return shape.getSubShapes().size() == 1
                && shape.getSubShapes().stream().findAny()
                .map(candidate -> getParameterOrThrow(shape, ShaclKeys.NODE_KIND)
                        .equalsIgnoreCase(ShaclNodeKind.BLANK_NODE.getPath())

                ).orElse(false);
    }

    private String getParameterOrThrow(ShaclShape shape, BasicKeys path) {
        return Optional.ofNullable(shape.getStringParameter(path, null))
                .orElseThrow(() -> new SyntaxError("Missing "
                        + path.getPath() + " property in " + findShapeIdentifier(shape))
                );
    }

    private String findShapeIdentifier(ShaclShape shape) {
        return shape.getStringParameter(ShaclKeys.LABEL_TEMPLATE,
                shape.getStringParameter(ShaclKeys.NAME,
                        shape.getStringParameter(ShaclKeys.PATH,
                                shape.getStringParameter(ShaclKeys.DESCRIPTION,
                                        "unnamed shape"
                                )
                        )
                )
        );
    }

    public static ShaclShape nodeToShaclShape(ShaclFactory.ShaclFactoryTreeNode node) {
        ShaclShape shape = createShaclShapeByNodeKind(
                node.getSubject(),
                toNodeKind(node.getAttribute(ShaclKeys.NODE_KIND))
        );
        node.getAttributes().forEach((predicate, obj) -> ShaclMapper.addParameter(shape, predicate, obj));
        node.getProperties().stream()
                .map(ShaclMapper::nodeToShaclShape)
                .forEach(shape::addSubShape);
        return shape;
    }

    private static void addParameter(ShaclShape shape, BasicKeys predicate, Node obj) {
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

    public boolean fieldExists(ShaclShape shape) {
        final String name = getParameterOrThrow(shape, FieldKeys.NAME);
        final Long version = Long.parseLong(getParameterOrThrow(shape, FieldKeys.VERSION));
        return fieldService.getAllFields().stream()
                .anyMatch(f -> f.getName().equalsIgnoreCase(name) && f.getVersion().equals(version));
    }

    public boolean assetTypeExists(ShaclShape shape) {
        final String name = getParameterOrThrow(shape, AssetTypeKeys.NAME);
        final Long version = Long.parseLong(getParameterOrThrow(shape, AssetTypeKeys.VERSION));
        return assetTypeService.getAllAssetTypes().stream()
                .anyMatch(at -> at.getName().equalsIgnoreCase(name) && at.getVersion().equals(version));
    }

    public boolean assetTypeTemplateExists(ShaclShape shape) {
        final String name = getParameterOrThrow(shape, ShaclKeys.NAME);
        final Long version = Long.parseLong(getParameterOrThrow(shape, IfsKeys.VERSION));
        return assetTypeTemplateService.getAllAssetTypeTemplates().stream()
                .anyMatch(att -> att.getName().equalsIgnoreCase(name) && att.getVersion().equals(version));
    }

    boolean assetSeriesExists(ShaclShape shape) {
        final String name = getParameterOrThrow(shape, ShaclKeys.NAME);
        final Long version = Long.parseLong(getParameterOrThrow(shape, IfsKeys.VERSION));
        return assetSeriesService.getAllAssetSeries().stream()
                .anyMatch(as -> as.getName().equalsIgnoreCase(name) && as.getVersion().equals(version));
    }


    public QuantityType mapQuantityType(ShaclShape sub) {
        return QuantityType.builder()
                .name(getParameterOrThrow(sub, QuantityTypeKeys.NAME))
                .version(Long.parseLong(getParameterOrThrow(sub, QuantityTypeKeys.VERSION)))
                .dataType(QuantityDataType.valueOf(getParameterOrThrow(sub, QuantityTypeKeys.DATATYPE)))
                .description(getParameterOrThrow(sub, QuantityTypeKeys.DESCRIPTION))
                .label(getParameterOrThrow(sub, QuantityTypeKeys.LABEL))
                .build();
    }

    public Unit mapUnit(ShaclShape shape) {
        return Unit.builder()
                .version(Long.parseLong(getParameterOrThrow(shape, UnitKeys.VERSION)))
                .name(getParameterOrThrow(shape, UnitKeys.NAME))
                .label(getParameterOrThrow(shape, UnitKeys.LABEL))
                .symbol(getParameterOrThrow(shape, UnitKeys.SYMBOL))
                .quantityType(mapQuantityType(shape))
                .build();
    }

    public Field mapField(ShaclShape sub) {
        return Field.builder()
                .name(getParameterOrThrow(sub, FieldKeys.NAME))
                .label(getParameterOrThrow(sub, FieldKeys.LABEL))
                .version(Long.parseLong(getParameterOrThrow(sub, FieldKeys.VERSION)))
                .accuracy(Double.parseDouble(getParameterOrThrow(sub, FieldKeys.ACCURARCY)))
                .description(getParameterOrThrow(sub, FieldKeys.DESCRIPTION))
                .unit(Optional.ofNullable(sub.getStringParameter(FieldKeys.UNIT, null))
                        .map(this::getUnit)
                        .orElse(null))
                .thresholdType(FieldThresholdType.valueOf(getParameterOrThrow(sub, FieldKeys.THRESHOLD_TYPE)))
                .widgetType(Optional.ofNullable(sub.getStringParameter(FieldKeys.WIDGET_TYPE, null))
                        .map(FieldWidgetType::valueOf)
                        .orElse(null))
                .creationDate(OffsetDateTime.parse(getParameterOrThrow(sub, FieldKeys.CREATION_DATE)))
                .options(mapOptions(sub.getSubShapes().stream()
                        .filter(this::isPropertyShape).collect(Collectors.toSet())))
                .dataType(FieldDataType.asEnum(getParameterOrThrow(sub, ShaclKeys.DATATYPE)).orElseThrow())
                .build();
    }

    private Set<FieldOption> mapOptions(Collection<ShaclShape> sub) {
        return sub.stream()
                .map(this::mapOption)
                .collect(Collectors.toSet());
    }

    private FieldOption mapOption(ShaclShape shape) {
        return FieldOption.builder()
                .label(getParameterOrThrow(shape, ShaclKeys.NAME))
                .build();
    }

    private FieldSource mapFieldSource(ShaclShape shape) {
        String fieldTargetIri = getParameterOrThrow(shape, ShaclKeys.PATH);
        ShaclShape sub = shape.getSubShapes().stream().findAny()
                .orElseThrow(() -> new SyntaxError("Missing sub shape in " + fieldTargetIri));
        FieldTarget fieldTarget = fieldTargetService.getAllFieldTargets().stream()
                .filter(ft -> ShaclHelper.createIriIfNeeded(ft.getName()).equalsIgnoreCase(fieldTargetIri))
                .findAny().orElseThrow(() -> new SyntaxError("Missing field target " + fieldTargetIri));
        return FieldSource.builder()
                .name(fieldTarget.getName())
                .version(fieldTarget.getVersion())
                .sourceUnit(fieldTarget.getField().getUnit())
                .description(fieldTarget.getDescription())
                .register(sub.getStringParameter(IfsKeys.REGISTER, null))
                .value(sub.getStringParameter(IfsKeys.DEFAULT, null))
                .idealThreshold(mapThreshold(sub,
                        IfsKeys.IDEAL_THRESHOLD_LOWER,
                        IfsKeys.IDEAL_THRESHOLD_UPPER))
                .absoluteThreshold(mapThreshold(sub,
                        IfsKeys.ABSOLUTE_THRESHOLD_LOWER,
                        IfsKeys.ABSOLUTE_THRESHOLD_UPPER))
                .criticalThreshold(mapThreshold(sub,
                        IfsKeys.CRITICAL_THRESHOLD_LOWER,
                        IfsKeys.CRITICAL_THRESHOLD_UPPER))
                .fieldTarget(fieldTarget)
                .build();
    }

    private Threshold mapThreshold(ShaclShape shape, IfsKeys lower, IfsKeys upper) {
        return shape.containsParameter(lower) && shape.containsParameter(upper)
                ? Threshold.builder()
                .valueLower(shape.getDoubleParameter(lower))
                .valueUpper(shape.getDoubleParameter(upper))
                .build()
                : null;
    }

    private FieldTarget mapFieldTarget(ShaclShape shape) {
        ShaclShape sub = shape.getSubShapes().stream().findAny().orElseThrow();
        String fieldPath = getParameterOrThrow(sub, IfsKeys.FIELD);
        Field field = fieldService.getAllFields().stream()
                .filter(f -> ShaclHelper.createFieldIri(f).equalsIgnoreCase(fieldPath))
                .findAny()
                .orElseThrow(() -> new SyntaxError("Unknown field " + fieldPath));
        return FieldTarget.builder()
                .name(field.getName())
                .label(field.getLabel())
                .description(field.getDescription())
                .version(field.getVersion())
                .fieldType(FieldType.valueOf(getParameterOrThrow(sub, IfsKeys.FIELD_TYPE)))
                .mandatory(getParameterOrThrow(sub, ShaclKeys.MIN_COUNT).equals("1"))
                .dashboardGroup(getParameterOrThrow(sub, IfsKeys.FIELD_DASHBOARD_GROUP))
                .field(field)
                .build();
    }

    public AssetType mapAssetType(ShaclShape shape) {
        return AssetType.builder()
                .name(getParameterOrThrow(shape, AssetTypeKeys.NAME))
                .version(Long.parseLong(getParameterOrThrow(shape, AssetTypeKeys.VERSION)))
                .label(shape.getStringParameter(AssetTypeKeys.LABEL))
                //TODO: Description must not be null, but is not mandatory
                .description(shape.getStringParameter(AssetTypeKeys.DESCRIPTION, ""))
                .build();
    }

    public AssetTypeTemplate mapAssetTypeTemplate(ShaclShape shape) {
        return AssetTypeTemplate.builder()
                .assetType(getAssetType(getParameterOrThrow(shape, IfsKeys.ASSET_TYPE)))
                .name(getParameterOrThrow(shape, ShaclKeys.NAME))
                .description(getParameterOrThrow(shape, ShaclKeys.DESCRIPTION))
                .version(Long.parseLong(getParameterOrThrow(shape, IfsKeys.VERSION)))
                .creationDate(OffsetDateTime.parse(getParameterOrThrow(shape, IfsKeys.CREATION_DATE)))
                .publishedDate(OffsetDateTime.parse(getParameterOrThrow(shape, IfsKeys.PUBLISHED_DATE)))
                .publishedVersion(Long.parseLong(getParameterOrThrow(shape, IfsKeys.PUBLISHED_VERSION)))
                .publicationState(PublicationState.valueOf(getParameterOrThrow(shape, IfsKeys.PUBLICATION_STATE)))
                .fieldTargets(shape.getSubShapes().stream()
                        .filter(this::isPropertyShape)
                        .sorted(this::sortByOrderId)
                        .map(this::mapFieldTarget)
                        .collect(Collectors.toSet()))
                .subsystems(shape.getSubShapes().stream()
                        .filter(this::isSubShape)
                        .sorted(this::sortByOrderId)
                        .map(this::mapAssetTypeTemplate)
                        .collect(Collectors.toSet()))
                .build();
    }

    public AssetSeries mapAssetSeries(ShaclShape shape, Long companyId) {
        return AssetSeries.builder()
                .assetTypeTemplate(getAssetTypeTemplate(getParameterOrThrow(shape, IfsKeys.ASSET_TYPE_TEMPLATE)))
                .name(getParameterOrThrow(shape, ShaclKeys.NAME))
                .description(shape.getStringParameter(ShaclKeys.DESCRIPTION, null))
                .version(Long.parseLong(getParameterOrThrow(shape, IfsKeys.VERSION)))
                .handbookUrl(getFromExtraPropertyShape(shape, IfsKeys.ASSET_MANUAL))
                .videoUrl(getFromExtraPropertyShape(shape, IfsKeys.ASSET_VIDEO))
                .ceCertified(Boolean.parseBoolean(getFromExtraPropertyShape(shape, IfsKeys.CE_CERTIFICATION)))
                .protectionClass(getFromExtraPropertyShape(shape, IfsKeys.PROTECTION_CLASS))
                .imageKey(getFromExtraPropertyShape(shape, IfsKeys.IMAGE_KEY))
                .company(companyService.getCompany(companyId, true))
                .connectivitySettings(extractConnectivitySettings(shape))
                .customScript(getFromExtraPropertyShape(shape, IfsKeys.CUSTOM_SCRIPT))
                .fieldSources(shape.getSubShapes().stream()
                        .filter(this::isPropertyShape)
                        .filter(p -> !IfsKeys.containsPath(getParameterOrThrow(p, ShaclKeys.PATH)))
                        .map(this::mapFieldSource)
                        .collect(Collectors.toSet()))
                .build();
    }

    private AssetTypeTemplate getAssetTypeTemplate(String assetTypeTemplateName) {
        return assetTypeTemplateService.getAllAssetTypeTemplates().stream()
                .filter(att -> ShaclHelper.createIriIfNeeded(att.getName())
                        .equalsIgnoreCase(assetTypeTemplateName))
                .findAny()
                .orElseThrow(() -> new SyntaxError("Unknown asset type template " + assetTypeTemplateName));

    }

    private AssetType getAssetType(String name) {
        return assetTypeService.getAllAssetTypes().stream()
                .filter(a -> name.equalsIgnoreCase(ShaclHelper.createIriIfNeeded(a.getName())))
                .findAny()
                .orElseThrow(() -> new SyntaxError("Unknown asset type " + name));

    }

    private Unit getUnit(String name) {
        return unitService.getAllUnits().stream()
                .filter(u -> name.equals(ShaclHelper.createUnitIri(u)))
                .findAny()
                .orElseThrow(() -> new SyntaxError("Unknown unit " + name));
    }


}
