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

package io.fusion.fusionbackend.service.ngsild;

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.FieldInstance;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.shacl.enums.BasicKeys;
import io.fusion.fusionbackend.model.shacl.enums.IfsKeys;
import io.fusion.fusionbackend.model.shacl.enums.NgsiLdKeys;
import io.fusion.fusionbackend.service.AssetSeriesService;
import io.fusion.fusionbackend.service.shacl.ShaclHelper;
import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.shared.SyntaxError;
import org.apache.jena.vocabulary.XSD;
import org.json.simple.JSONObject;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NgsiLdMapper {

    private final AssetSeriesService assetSeriesService;

    public NgsiLdMapper(AssetSeriesService assetSeriesService) {
        this.assetSeriesService = assetSeriesService;
    }

    public JsonObjectBuilder mapAssetToJson(Asset asset) {
        JsonObjectBuilder builder = Json.createObjectBuilder()
                .add(NgsiLdKeys.ID.getPath(), asset.getExternalName())
                .add(NgsiLdKeys.TYPE.getPath(),
                        ShaclHelper.createIriIfNeeded(asset.getAssetSeries().getAssetTypeTemplate()
                                .getAssetType().getName()));
        asExtraProperty(builder, IfsKeys.SERIAL_NUMBER,
                        Optional.ofNullable(asset.getSerialNumber()).orElse(""));
        asExtraProperty(builder, IfsKeys.CONNECTION_STRING,
                        Optional.ofNullable(asset.getConnectionString()).orElse(""));
        asExtraProperty(builder, IfsKeys.CONNECTIVITY_TYPE,
                        Optional.ofNullable(asset.getControlSystemType()).orElse(""));
        asExtraProperty(builder, IfsKeys.CONNECTIVITY_PROTOCOL,
                        Optional.ofNullable(asset.getGatewayConnectivity()).orElse(""));
        asExtraProperty(builder, IfsKeys.ASSET_MANUAL,
                        Optional.ofNullable(asset.getHandbookUrl()).orElse(""));
        asExtraProperty(builder, IfsKeys.ASSET_VIDEO,
                        Optional.ofNullable(asset.getVideoUrl()).orElse(""));
        asExtraProperty(builder, IfsKeys.CE_CERTIFICATION,
                        Optional.ofNullable(asset.getCeCertified()).orElse(false));
        asExtraProperty(builder, IfsKeys.PROTECTION_CLASS,
                        Optional.ofNullable(asset.getProtectionClass()).orElse(""));
        asExtraProperty(builder, IfsKeys.IMAGE_KEY,
                        Optional.ofNullable(asset.getImageKey()).orElse(""));
        asExtraProperty(builder, IfsKeys.CONSTRUCTION_DATE,
                        Optional.ofNullable(asset.getConstructionDate())
                                .map(OffsetDateTime::toString)
                                .orElse(""));
        asExtraProperty(builder, IfsKeys.INSTALLATION_DATE,
                        Optional.ofNullable(asset.getInstallationDate())
                                .map(OffsetDateTime::toString)
                                .orElse(""));
        asset.getFieldInstances()
                .forEach((field) -> asFieldSourceProperty(builder, field.getFieldSource()));
        asset.getSubsystems()
                .forEach(this::mapAssetToJson);
        return builder;
    }

    private void asExtraProperty(JsonObjectBuilder builder, BasicKeys path,
                                 String value) {
        asProperty(builder, path.getPath(), value);
    }

    private void asExtraProperty(JsonObjectBuilder builder, BasicKeys path,
                                 Boolean value) {
        asProperty(builder, path.getPath(), value);
    }

    private void asProperty(JsonObjectBuilder builder,
                            String path,
                            String value) {
        builder.add(path,
                Json.createObjectBuilder()
                        .add(NgsiLdKeys.TYPE.getPath(), "Property")
                        .add(NgsiLdKeys.HAS_PATH.getPath(), value));

    }

    private void asProperty(JsonObjectBuilder builder,
                            String path,
                            Boolean value) {
        builder.add(path,
                Json.createObjectBuilder()
                        .add(NgsiLdKeys.TYPE.getPath(), "Property")
                        .add(NgsiLdKeys.HAS_PATH.getPath(), value));

    }

    private void asFieldSourceProperty(JsonObjectBuilder builder, FieldSource source) {
        if (source.getRegister() != null) {
            asProperty(builder,
                    ShaclHelper.createIriIfNeeded(source.getFieldTarget().getName()),
                    source.getValue() != null
                                    ? source.getValue()
                                    : "");
        }
    }

    public Asset mapAssetFromJson(JSONObject jsonAsset, Company company) {

        String id = findAssetIdOrThrow(jsonAsset);
        AssetSeries assetSeries = findAssetSeriesOrThrow(jsonAsset);
        Asset asset = new Asset();
        asset.setAssetSeries(assetSeries);
        asset.setName(asset.getAssetSeries().getName());
        asset.setGlobalId(UUID.randomUUID().toString());
        asset.setGuid(UUID.randomUUID());
        asset.setExternalName(id);
        asset.setCompany(company);
        asset.setSerialNumber(getAndRemoveStringPropertyFromJson(jsonAsset, IfsKeys.SERIAL_NUMBER.getPath()));
        asset.setConnectionString(getAndRemoveStringPropertyFromJson(jsonAsset, IfsKeys.CONNECTION_STRING.getPath()));
        asset.setControlSystemType(getAndRemoveStringPropertyFromJson(jsonAsset, IfsKeys.CONNECTIVITY_TYPE.getPath()));
        asset.setGatewayConnectivity(getAndRemoveStringPropertyFromJson(jsonAsset,
                IfsKeys.CONNECTIVITY_PROTOCOL.getPath()));
        asset.setHandbookUrl(getAndRemoveStringPropertyFromJson(jsonAsset, IfsKeys.ASSET_MANUAL.getPath()));
        asset.setImageKey(getAndRemoveStringPropertyFromJson(jsonAsset, IfsKeys.IMAGE_KEY.getPath()));
        asset.setVideoUrl(getAndRemoveStringPropertyFromJson(jsonAsset, IfsKeys.ASSET_VIDEO.getPath()));
        asset.setCeCertified(getAndRemoveBooleanPropertyFromJson(jsonAsset, IfsKeys.CE_CERTIFICATION.getPath()));
        asset.setProtectionClass(getAndRemoveStringPropertyFromJson(jsonAsset, IfsKeys.PROTECTION_CLASS.getPath()));
        asset.setConstructionDate(getAndRemoveOffsetDateTimePropertyFromJson(jsonAsset,
                IfsKeys.CONSTRUCTION_DATE.getPath()));
        asset.setInstallationDate(getAndRemoveOffsetDateTimePropertyFromJson(jsonAsset,
                IfsKeys.INSTALLATION_DATE.getPath()));

        jsonAsset.remove(NgsiLdKeys.TYPE.getPath());
        jsonAsset.remove(NgsiLdKeys.CONTEXT.getPath());

        //noinspection unchecked
        asset.setFieldInstances(
                ((Set<Map.Entry<String, JSONObject>>) jsonAsset.entrySet()).stream()
                        .map(entry -> mapToFieldInstances(entry.getKey(),
                                jsonAsset,
                                assetSeries))
                        .collect(Collectors.toSet()));
        return asset;
    }

    private FieldInstance mapToFieldInstances(String path, JSONObject jsonAsset, AssetSeries series) {
        FieldSource fieldSource = getFieldSourceOrThrow(path, series);
        //noinspection unchecked
        return FieldInstance.builder()
                .name(fieldSource.getName())
                .externalName(fieldSource.getName())
                .description(fieldSource.getDescription())
                .version(fieldSource.getVersion())
                .value(getStringPropertyFromJson(jsonAsset, path))
                .globalId(UUID.randomUUID().toString())
                .fieldSource(fieldSource)
                .idealThreshold(fieldSource.getIdealThreshold())
                .absoluteThreshold(fieldSource.getAbsoluteThreshold())
                .criticalThreshold(fieldSource.getCriticalThreshold())
                .build();
    }

    private FieldSource getFieldSourceOrThrow(String path, AssetSeries series) {
        return series.getFieldSources().stream()
                .filter(fs -> path.equalsIgnoreCase(ShaclHelper.createIriIfNeeded(fs.getName())))
                .findAny()
                .orElseThrow(() -> new SyntaxError("Unknown field source " + path));
    }

    private String findAssetIdOrThrow(JSONObject jsonAsset) {
        if (!jsonAsset.containsKey(NgsiLdKeys.ID.getPath())) {
            throw new SyntaxError("Missing asset id");
        }
        String id = jsonAsset.get(NgsiLdKeys.ID.getPath()).toString();
        jsonAsset.remove(NgsiLdKeys.ID.getPath());
        return id;
    }

    private AssetSeries findAssetSeriesOrThrow(JSONObject jsonAsset) {
        String asp = jsonAsset.get(NgsiLdKeys.TYPE.getPath()).toString();
        return assetSeriesService.getAllAssetSeries().stream()
                .filter(assetSeries -> asp.equalsIgnoreCase(ShaclHelper.createIriIfNeeded(assetSeries.getName())))
                .findAny()
                .orElseThrow(() -> new SyntaxError("Unknown asset series "
                        + jsonAsset.get(NgsiLdKeys.TYPE.getPath()).toString()));
    }

    private String getAndRemoveStringPropertyFromJson(JSONObject jsonAsset, String path) {
        return getPropertyFromJson(jsonAsset, path, XSD.xstring, String.class, true);
    }

    private String getStringPropertyFromJson(JSONObject jsonAsset, String path) {
        return getPropertyFromJson(jsonAsset, path, XSD.xstring, String.class, false);
    }

    private boolean getAndRemoveBooleanPropertyFromJson(JSONObject jsonAsset, String path) {
        return getPropertyFromJson(jsonAsset, path, XSD.xboolean, Boolean.class, true);
    }

    private OffsetDateTime getAndRemoveOffsetDateTimePropertyFromJson(JSONObject json, String path) {
        String value = getPropertyFromJson(json, path, XSD.date, String.class, true);
        return value.isEmpty() ? null : OffsetDateTime.parse(value);
    }

    @SuppressWarnings("unchecked")
    private <T> T getPropertyFromJson(JSONObject jsonAsset,
                                      String path, Resource dataType,
                                      Class<T> resultType,
                                      boolean remove
    ) {
        if (!jsonAsset.containsKey(path)) {
            throw new SyntaxError("Missing property " + path);
        }
        Object value = jsonAsset.get(path);
        if (!(value instanceof JSONObject)) {
            throw new SyntaxError(path + " has no property object");
        }
        if (!((JSONObject) value).containsKey(NgsiLdKeys.HAS_PATH.getPath())) {
            throw new SyntaxError("Missing " + NgsiLdKeys.HAS_PATH.getPath() + " property object of " + path);
        }
        value = ((JSONObject) value).get(NgsiLdKeys.HAS_PATH.getPath());
        if (!(value instanceof JSONObject)) {
            throw new SyntaxError(NgsiLdKeys.HAS_PATH.getPath() + " of " + path + " has no sub object");
        }
        if (!((JSONObject) value).containsKey("type")) {
            throw new SyntaxError(path + " has no type in " + NgsiLdKeys.HAS_PATH.getPath());
        }

        if (!((String) ((JSONObject) value).get("type")).equalsIgnoreCase(dataType.getURI())) {
            throw new SyntaxError(path + " has wrong type in " + NgsiLdKeys.HAS_PATH.getPath());
        }

        if (!((JSONObject) value).containsKey("value")) {
            throw new SyntaxError(path + " has no value in " + NgsiLdKeys.HAS_PATH.getPath());
        }
        value = ((JSONObject) value).get("value");
        if (!(value.getClass().equals(resultType))) {
            throw new SyntaxError("value of " + path + " is no " + resultType.getSimpleName() + " property");
        }
        if (remove) {
            jsonAsset.remove(path);
        }
        return (T) value;
    }

}
