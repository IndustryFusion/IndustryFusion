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

package io.fusion.fusionbackend.service.ngsilj;

import io.fusion.fusionbackend.config.ShaclConfig;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.FieldInstance;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.shacl.enums.NgsiLdPaths;
import io.fusion.fusionbackend.service.shacl.ShaclHelper;
import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;
import org.springframework.stereotype.Service;

import java.util.AbstractMap;
import java.util.Map;

@Service
public class NgsiLdMapper {

    private final ShaclConfig shaclConfig;

    public NgsiLdMapper(ShaclConfig shaclConfig) {
        this.shaclConfig = shaclConfig;
    }

    public JsonObjectBuilder mapSeriesAssetToJson(Asset asset) {
        JsonObjectBuilder builder = Json.createObjectBuilder()
                .add("@id", ShaclHelper.createAssetIriId(1L, asset, shaclConfig.getDefaultPrefix()))
                .add("@type", ShaclHelper.createAssetIriWithSerial(asset, shaclConfig.getDefaultPrefix()));
        asset.getFieldInstances().stream()
                .map(FieldInstance::getFieldSource)
                .map(this::mapFieldSourceToJson)
                .forEach((entry) -> builder.add(entry.getKey(), entry.getValue()));
        asset.getSubsystems()
                .forEach(this::mapSeriesAssetToJson);
        return builder;
    }

    private Map.Entry<String, JsonObjectBuilder> mapFieldSourceToJson(FieldSource source) {
        JsonObjectBuilder value = Json.createObjectBuilder();
        switch (source.getFieldTarget().getField().getDataType()) {
            case NUMERIC:
                value.add("unitCode", source.getSourceUnit().getSymbol());
                if (source.getValue() != null && !source.getValue().isEmpty()) {
                    value.add("@value", Long.parseLong(source.getValue()));
                }
                break;
            case ENUM:
                value.add("@id", ShaclHelper.createIriIfNeeded(source.getValue(),
                        shaclConfig.getDefaultPrefix()));
                break;
            default:
        }
        return new AbstractMap.SimpleEntry<>(ShaclHelper.createIriIfNeeded(source.getFieldTarget().getName(),
                shaclConfig.getDefaultPrefix()),
                Json.createObjectBuilder()
                        .add("@type", "Property")
                        .add(NgsiLdPaths.HAS_PATH.getPath(), value));
    }
}
