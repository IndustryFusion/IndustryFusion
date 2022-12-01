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

public enum ShaclPaths implements BasicPaths {

    CLASS(ShaclPaths.BASE_PATH + "class"),
    TARGET_CLASS(ShaclPaths.BASE_PATH + "targetClass"),
    SEVERITY(ShaclPaths.BASE_PATH + "severity"),
    DEACTIVATED(ShaclPaths.BASE_PATH + "deactivated"),
    PATH(ShaclPaths.BASE_PATH + "path"),
    NAME(ShaclPaths.BASE_PATH + "name"),
    PROPERTY(ShaclPaths.BASE_PATH + "property"),
    OPTIONAL(ShaclPaths.BASE_PATH + "optional"),
    LABEL_TEMPLATE(ShaclPaths.BASE_PATH + "labelTemplate"),
    DESCRIPTION(ShaclPaths.BASE_PATH + "description"),
    ORDER(ShaclPaths.BASE_PATH + "order"),
    GROUP(ShaclPaths.BASE_PATH + "group"),
    DEFAULT_VALUE(ShaclPaths.BASE_PATH + "defaultValue"),
    DATATYPE(ShaclPaths.BASE_PATH + "dataType"),
    NODE_KIND(ShaclPaths.BASE_PATH + "NodeKind"),
    MIN_COUNT(ShaclPaths.BASE_PATH + "minCount"),
    MAX_COUNT(ShaclPaths.BASE_PATH + "maxCount"),
    MAX_LENGTH(ShaclPaths.BASE_PATH + "maxLength"),
    MIN_LENGTH(ShaclPaths.BASE_PATH + "minLength"),
    PATTERN(ShaclPaths.BASE_PATH + "pattern"),
    FLAGS(ShaclPaths.BASE_PATH + "flags"),
    CLOSED(ShaclPaths.BASE_PATH + "closed"),
    IGNORED_PROPERTIES(ShaclPaths.BASE_PATH + "ignoredProperties"),
    HAS_VALUE(ShaclPaths.BASE_PATH + "hasValue"),
    VALUE(ShaclPaths.BASE_PATH + "value");

    private String path;

    public static final String BASE_PATH = "http://www.w3.org/ns/shacl#";


    @Override
    public String getPath() {
        return path;
    }

    ShaclPaths(String path) {
        this.path = path;
    }

    public static Optional<ShaclPaths> asEnum(String uri) {
        return Arrays.stream(ShaclPaths.values())
                .filter(candidate -> candidate.getPath().equalsIgnoreCase(uri)).findAny();
    }

}
