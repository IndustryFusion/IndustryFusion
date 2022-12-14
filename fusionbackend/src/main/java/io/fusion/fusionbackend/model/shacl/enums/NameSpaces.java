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

package io.fusion.fusionbackend.model.shacl.enums;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public enum NameSpaces {

    FIELD("iff", NameSpaces.BASE_PATH + "/fields#"),
    QUANTITY_TYPES("ifq", NameSpaces.BASE_PATH + "/quantityTypes#"),
    UNIT("ifu", NameSpaces.BASE_PATH + "/units#"),
    ASSET_TYPE("ifat", NameSpaces.BASE_PATH + "/assetTypes#"),
    NGSI_LD("ngsi", "https://uri.etsi.org/ngsi-ld/"),
    SHACL("sh", "http://www.w3.org/ns/shacl#"),
    XML("xml", "http://www.w3.org/2001/XMLSchema#"),
    IF("if", NameSpaces.BASE_PATH + "/schema#");

    private final String ns;
    private final String path;

    public static final String BASE_PATH = "http://www.industry-fusion.org";

    public static Map<String, String> getAsPrefixes() {
        Map<String, String> prefixes = new HashMap<>();
        Arrays.stream(NameSpaces.values())
                .forEach(ns -> prefixes.put(ns.ns, ns.path));
        return prefixes;
    }

    public String getNs() {
        return ns;
    }

    public String getPath() {
        return path;
    }

    NameSpaces(String ns, String path) {
        this.ns = ns;
        this.path = path;
    }

    public static Optional<NameSpaces> asEnum(String uri) {
        return Arrays.stream(NameSpaces.values())
                .filter(candidate -> candidate.getPath().equalsIgnoreCase(uri)).findAny();
    }
}
