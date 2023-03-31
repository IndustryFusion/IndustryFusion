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

public enum NgsiLdKeys implements BasicKeys {
    HAS_PATH(NameSpaces.NGSI_LD.getPath() + "hasValue"),
    HAS_RELATIONSHIP(NameSpaces.NGSI_LD.getPath() + "hasObject"),
    CONTEXT("@context"),
    TYPE("type"),
    VALUE("value"),
    ID("id");


    private final String path;

    NgsiLdKeys(String path) {
        this.path = path;
    }

    @Override
    public String getPath() {
        return path;
    }

    public static Optional<NgsiLdKeys> asEnum(String uri) {
        return Arrays.stream(NgsiLdKeys.values())
                .filter(candidate -> candidate.getPath().equalsIgnoreCase(uri)).findAny();
    }
}
