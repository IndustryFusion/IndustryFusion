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

package io.fusion.fusionbackend.model.enums;

import io.fusion.fusionbackend.model.shacl.enums.BasicPaths;
import io.fusion.fusionbackend.model.shacl.enums.ShaclPaths;

import java.util.Arrays;
import java.util.Optional;

public enum FieldDataType implements BasicPaths {
    NUMERIC(FieldDataType.BASE_PATH + "decimal"),
    ENUM(FieldDataType.BASE_PATH + "enumeration");

    private String path;

    public static final String BASE_PATH = "http://www.w3.org/2001/XMLSchema#";


    @Override
    public String getPath() {
        return path;
    }

    FieldDataType(String path) {
        this.path = path;
    }

    public static Optional<ShaclPaths> asEnum(String uri) {
        return Arrays.stream(ShaclPaths.values())
                .filter(candidate -> candidate.getPath().equalsIgnoreCase(uri)).findAny();
    }


}
