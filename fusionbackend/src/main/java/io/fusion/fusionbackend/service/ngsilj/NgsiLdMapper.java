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
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.shacl.enums.BasicPaths;
import io.fusion.fusionbackend.model.shacl.enums.IfsPaths;
import io.fusion.fusionbackend.model.shacl.enums.NgsiLdPaths;
import io.fusion.fusionbackend.service.NgsiLdSerializer;
import io.fusion.fusionbackend.service.shacl.ShaclHelper;
import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.XSD;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class NgsiLdMapper {

    private final ShaclConfig shaclConfig;
    private final NgsiLdSerializer ngsiLdSerializer;

    public NgsiLdMapper(ShaclConfig shaclConfig, NgsiLdSerializer ngsiLdSerializer) {
        this.shaclConfig = shaclConfig;
        this.ngsiLdSerializer = ngsiLdSerializer;
    }

    public JsonObjectBuilder mapAssetToJson(Asset asset) {
        JsonObjectBuilder builder = Json.createObjectBuilder()
                .add("id", ngsiLdSerializer.generateUrn(asset))
                .add("type", ShaclHelper.createAssetIriWithSerial(asset, shaclConfig.getDefaultPrefix()));
        asExtraProperty(builder, IfsPaths.SERIAL_NUMBER, XSD.xstring,
                (value) -> value.add("value", Optional.ofNullable(asset.getSerialNumber()).orElse("")));
        asExtraProperty(builder, IfsPaths.CONNECTION_STRING, XSD.xstring,
                (value) -> value.add("value", Optional.ofNullable(asset.getConnectionString()).orElse("")));
        asExtraProperty(builder, IfsPaths.CONNECTIVITY_TYPE, XSD.xstring,
                (value) -> value.add("value", Optional.ofNullable(asset.getControlSystemType()).orElse("")));
        asExtraProperty(builder, IfsPaths.CONNECTIVITY_PROTOCOL, XSD.xstring,
                (value) -> value.add("value", Optional.ofNullable(asset.getGatewayConnectivity()).orElse("")));
        asExtraProperty(builder, IfsPaths.ASSET_MANUAL, XSD.xstring,
                (value) -> value.add("value", Optional.ofNullable(asset.getHandbookUrl()).orElse("")));
        asExtraProperty(builder, IfsPaths.ASSET_VIDEO, XSD.xstring,
                (value) -> value.add("value", Optional.ofNullable(asset.getVideoUrl()).orElse("")));
        asExtraProperty(builder, IfsPaths.CE_CERTIFICATION, XSD.xboolean,
                (value) -> value.add("value", Optional.ofNullable(asset.getCeCertified()).orElse(false)));
        asExtraProperty(builder, IfsPaths.PROTECTION_CLASS, XSD.xstring,
                (value) -> value.add("value", Optional.ofNullable(asset.getProtectionClass()).orElse("")));
        asExtraProperty(builder, IfsPaths.CONSTRUCTION_DATE, XSD.date,
                (value) -> value.add("value",
                        Optional.ofNullable(asset.getConstructionDate())
                                .map(OffsetDateTime::toString)
                                .orElse("")));
        asExtraProperty(builder, IfsPaths.INSTALLATION_DATE, XSD.date,
                (value) -> value.add("value",
                        Optional.ofNullable(asset.getInstallationDate())
                                .map(OffsetDateTime::toString)
                                .orElse("")));
        asset.getFieldInstances()
                .forEach((field) -> asFieldSourceProperty(builder, field.getFieldSource()));
        asset.getSubsystems()
                .forEach(this::mapAssetToJson);
        return builder;
    }

    private void asExtraProperty(JsonObjectBuilder builder, BasicPaths path, Resource dataType,
                                 ShaclHelper.LambdaWrapper<JsonObjectBuilder> value) {
        asProperty(builder, dataType.getURI(), path.getPath(), value);
    }

    private void asProperty(JsonObjectBuilder builder,
                            String type,
                            String path,
                            ShaclHelper.LambdaWrapper<JsonObjectBuilder> value) {
        JsonObjectBuilder valueObject = Json.createObjectBuilder()
                .add("type", type);
        value.execute(valueObject);
        builder.add(path,
                Json.createObjectBuilder()
                        .add("type", "Property")
                        .add(NgsiLdPaths.HAS_PATH.getPath(), valueObject)
        );

    }

    private void asFieldSourceProperty(JsonObjectBuilder builder, FieldSource source) {
        if (source.getRegister() != null) {
            asProperty(builder, XSD.xstring.getURI(),
                    ShaclHelper.createIriIfNeeded(source.getFieldTarget().getName(),
                            shaclConfig.getDefaultPrefix()),
                    (value) -> value.add("value", source.getRegister()));
        }
    }

}
