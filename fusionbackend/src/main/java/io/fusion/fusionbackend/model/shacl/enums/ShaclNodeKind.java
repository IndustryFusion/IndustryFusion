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

public enum ShaclNodeKind {

    UNSET(""),
    IRI(NameSpaces.SHACL.getPath() + "IRI"),
    LITERAL(NameSpaces.SHACL.getPath() + "Literal"),
    BLANK_NODE(NameSpaces.SHACL.getPath() + "BlankNode");

    private String path;

    public String getPath() {
        return path;
    }

    ShaclNodeKind(String path) {
        this.path = path;
    }

    public static Optional<ShaclNodeKind> asEnum(String uri) {
        return Arrays.stream(ShaclNodeKind.values())
                .filter(candidate -> candidate.getPath().equalsIgnoreCase(uri)).findAny();
    }

}
