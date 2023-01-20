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
import java.util.Optional;

public enum ShaclKeys implements BasicKeys {

    CLASS(NameSpaces.SHACL.getPath() + "class"),
    TARGET_CLASS(NameSpaces.SHACL.getPath() + "targetClass"),
    SEVERITY(NameSpaces.SHACL.getPath() + "severity"),
    DEACTIVATED(NameSpaces.SHACL.getPath() + "deactivated"),
    PATH(NameSpaces.SHACL.getPath() + "path"),
    NAME(NameSpaces.SHACL.getPath() + "name"),
    PROPERTY(NameSpaces.SHACL.getPath() + "property"),
    OPTIONAL(NameSpaces.SHACL.getPath() + "optional"),
    LABEL_TEMPLATE(NameSpaces.SHACL.getPath() + "labelTemplate"),
    DESCRIPTION(NameSpaces.SHACL.getPath() + "description"),
    ORDER(NameSpaces.SHACL.getPath() + "order"),
    GROUP(NameSpaces.SHACL.getPath() + "group"),
    DEFAULT_VALUE(NameSpaces.SHACL.getPath() + "defaultValue"),
    DATATYPE(NameSpaces.SHACL.getPath() + "dataType"),
    NODE_KIND(NameSpaces.SHACL.getPath() + "nodeKind"),
    MIN_COUNT(NameSpaces.SHACL.getPath() + "minCount"),
    MAX_COUNT(NameSpaces.SHACL.getPath() + "maxCount"),
    MAX_LENGTH(NameSpaces.SHACL.getPath() + "maxLength"),
    MIN_LENGTH(NameSpaces.SHACL.getPath() + "minLength"),
    PATTERN(NameSpaces.SHACL.getPath() + "pattern"),
    FLAGS(NameSpaces.SHACL.getPath() + "flags"),
    CLOSED(NameSpaces.SHACL.getPath() + "closed"),
    IGNORED_PROPERTIES(NameSpaces.SHACL.getPath() + "ignoredProperties"),
    HAS_VALUE(NameSpaces.SHACL.getPath() + "hasValue"),
    VALUE(NameSpaces.SHACL.getPath() + "value");

    private String path;

    public static final String BASE_PATH = "http://www.w3.org/ns/shacl#";

    @Override
    public String getPath() {
        return path;
    }

    ShaclKeys(String path) {
        this.path = path;
    }

    public static Optional<ShaclKeys> asEnum(String uri) {
        return Arrays.stream(ShaclKeys.values())
                .filter(candidate -> candidate.getPath().equalsIgnoreCase(uri)).findAny();
    }

}
