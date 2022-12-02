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

package io.fusion.fusionbackend.service;

import com.github.jsonldjava.utils.JsonUtils;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.FieldInstance;
import io.fusion.fusionbackend.model.Threshold;
import io.fusion.fusionbackend.model.enums.QuantityDataType;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
public class NgsiLdSerializer {

    private static final Logger LOG = LoggerFactory.getLogger(NgsiLdSerializer.class);

    public static final String CONTEXT_NGSILD = "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld";

    private static class NgsiLdVocabulary {

        public static final String ID = "id";
        public static final String CONTEXT = "@context";
        public static final String RELATIONSHIP = "Relationship";
        public static final String OBJECT = "object";
        public static final String PROPERTY = "Property";
        public static final String VALUE = "value";
        public static final String TYPE = "type";
        public static final String UNIT_CODE = "unitCode";
    }


    public String getAssetByIdAsNgsiLD(Asset asset) {

        JSONObject root = new JSONObject();

        String id = generateUrn(asset);
        addId(root, id);

        addAssetType(asset, root);

        addSubsystems(asset, root);

        addMetainfo(asset, root);

        addContext(root);


        return getPrettyString(asset, root, id);
    }

    private void addId(JSONObject root, String id) {
        root.put(NgsiLdVocabulary.ID, id);
    }

    private String getPrettyString(Asset asset, JSONObject root, String id) {
        LOG.debug("Try to generate NGSI-LD File with ID: {}", id);
        String prettyString = null;
        try {
            prettyString = JsonUtils.toPrettyString(root);
        } catch (IOException e) {
            LOG.error("Unable to generate NGSI-LD File with ID: {} from Asset {}", id, asset.getId());
            throw new RuntimeException(e);
        }
        return prettyString;
    }

    private void addContext(JSONObject root) {
        JSONArray context = new JSONArray();
        context.add(CONTEXT_NGSILD);
        root.put(NgsiLdVocabulary.CONTEXT, context);
    }

    private void addMetainfo(Asset asset, JSONObject root) {
        JSONObject metainfo = new JSONObject();
        asset.getFieldInstances().forEach(fieldInstance -> {
            JSONObject jsonObject = new JSONObject();
            metainfo.put(getFieldInstanceCleanName(fieldInstance), jsonObject);
            addThreshold(jsonObject, "AbsoluteThreshold", fieldInstance.getAbsoluteThreshold());
            addThreshold(jsonObject, "CriticalThreshold", fieldInstance.getCriticalThreshold());
            addThreshold(jsonObject, "IdealThreshold", fieldInstance.getIdealThreshold());
            jsonObject.put("description", fieldInstance.getDescription());
            if (fieldInstance.getFieldSource().getRegister() != null) {
                jsonObject.put("register", fieldInstance.getFieldSource().getRegister());
            }
            jsonObject.put("fieldType", fieldInstance.getFieldSource().getFieldTarget().getFieldType());
        });
        addProperty(root, "metainfo", metainfo);
    }

    private void addSubsystems(Asset asset, JSONObject root) {
        List<String> urls = asset.getSubsystems().stream()
                .map(this::generateUrn)
                .collect(Collectors.toList());
        addRelationship(root, "subsystems", urls);
    }

    private void addAssetType(Asset asset, JSONObject root) {
        addType(root, cleanName(asset.getAssetSeries().getName()));

        asset.getFieldInstances().stream().forEach(fieldInstance -> {

            String value = Optional.ofNullable(fieldInstance.getValue()).orElse("");
            QuantityDataType quantityDataType = fieldInstance.getFieldSource()
                    .getSourceUnit().getQuantityType().getDataType();
            switch (quantityDataType) {
                case NUMERIC:
                    addProperty(root, getFieldInstanceCleanName(fieldInstance), value);
                    break;
                case CATEGORICAL:
                    addProperty(root, getFieldInstanceCleanName(fieldInstance), value,
                            fieldInstance.getFieldSource().getSourceUnit().getSymbol());
                    break;
                default:
                    LOG.error("unknown quantityType \"{}\" was used", quantityDataType);
                    throw new IllegalArgumentException();
            }
        });
    }

    private void addThreshold(JSONObject jsonObject, String name, Threshold threshold) {
        if (threshold != null) {
            jsonObject.put("upper" + name, threshold.getValueUpper());
            jsonObject.put("lower" + name, threshold.getValueLower());
        }
    }

    private String cleanName(String name) {
        name = name.replaceAll("[\\<\\\"\\'\\=\\;\\(\\)\\>\\?\\*\\s]", "");
        return name;
    }

    private String getFieldInstanceCleanName(FieldInstance fieldInstance) {
        String fieldName = fieldInstance.getExternalName();
        if (fieldName == null) {
            fieldName = fieldInstance.getFieldSource().getFieldTarget().getLabel();
        }
        fieldName = cleanName(fieldName);
        return fieldName;
    }

    public String generateUrn(Asset asset) {
        String id = new StringBuilder()
                .append("urn:ngsi-ld:asset:")
                .append(asset.getCompany().getId())
                .append(":")
                .append(asset.getId()).toString();

        return id;
    }

    private static void addRelationship(JSONObject json, String key, List<String> urls) {
        JSONArray jsonArray = new JSONArray();
        urls.forEach(url -> {
            JSONObject property = new JSONObject();
            addType(property, NgsiLdVocabulary.RELATIONSHIP);
            property.put(NgsiLdVocabulary.OBJECT, url);
            jsonArray.add(property);
        });

        json.put(key, jsonArray);
    }

    private static void addProperty(JSONObject json, String key, String value) {
        addProperty(json, key, value, null);
    }

    private static void addProperty(JSONObject json, String key, String value, String unitCode) {
        JSONObject property = new JSONObject();
        addType(property, NgsiLdVocabulary.PROPERTY);
        property.put(NgsiLdVocabulary.VALUE, value);
        if (unitCode != null) {
            property.put(NgsiLdVocabulary.UNIT_CODE, unitCode);
        }
        json.put(key, property);
    }

    private static void addProperty(JSONObject json, String key, JSONObject jsonObject) {
        JSONObject property = new JSONObject();
        addType(property, NgsiLdVocabulary.PROPERTY);
        property.put(NgsiLdVocabulary.VALUE, jsonObject);
        json.put(key, property);
    }

    private static Object addType(JSONObject json, String type) {
        return json.put(NgsiLdVocabulary.TYPE, type);
    }
}
