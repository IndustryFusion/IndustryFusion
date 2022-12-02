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

import io.fusion.fusionbackend.model.Asset;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.stream.JsonGenerator;
import org.apache.jena.shared.SyntaxError;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class NgsiLdBuilder {

    private final NgsiLdMapper ngsiLdMapper;

    public NgsiLdBuilder(NgsiLdMapper ngsiLdMapper) {
        this.ngsiLdMapper = ngsiLdMapper;
    }

    public void buildAssetNgsiLd(OutputStream stream, Asset asset) {
        JsonObject json = Json.createObjectBuilder()
                .add("@context", "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld")
                .addAll(ngsiLdMapper.mapAssetToJson(asset))
                .build();
        Json.createWriterFactory(getConfigMap())
                .createWriter(stream)
                .writeObject(json);
        try {
            stream.close();
        } catch (IOException e) {
            e.printStackTrace();
            throw new SyntaxError(e.getMessage());
        }
    }

    private Map<String, Object> getConfigMap() {
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put(JsonGenerator.PRETTY_PRINTING, Boolean.TRUE);
        return map;
    }


}
