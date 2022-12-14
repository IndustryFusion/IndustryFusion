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

import static io.fusion.fusionbackend.model.shacl.enums.NameSpaces.FIELD;

public enum FieldKeys implements BasicKeys {
    VERSION(FIELD.getPath() + "version"),
    NAME(FIELD.getPath() + "name"),
    LABEL(FIELD.getPath() + "label"),
    DESCRIPTION(FIELD.getPath() + "description"),
    CREATION_DATE(FIELD.getPath() + "creationDate"),
    ACCURARCY(FIELD.getPath() + "accurarcy"),
    OPTIONS(FIELD.getPath() + "options"),
    WIDGET_TYPE(FIELD.getPath() + "widgetType"),
    UNIT(FIELD.getPath() + "unit"),
    THRESHOLD_TYPE(FIELD.getPath() + "thresholdType");

    private final String path;

    @Override
    public String getPath() {
        return path;
    }

    FieldKeys(String path) {
        this.path = path;
    }

    public static Optional<FieldKeys> asEnum(String uri) {
        return Arrays.stream(FieldKeys.values())
                .filter(candidate -> candidate.getPath().equalsIgnoreCase(uri)).findAny();
    }

}
