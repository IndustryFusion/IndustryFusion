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

package io.fusion.fusionbackend.model.shacl;

import io.fusion.fusionbackend.model.shacl.enums.ShaclKeys;

import java.util.stream.Collectors;

public class NodeShape extends ShaclShape {

    private final String shapeLabel;

    public NodeShape(String shapeLabel, String targetClass) {
        this.shapeLabel = shapeLabel;
        addParameter(ShaclKeys.TARGET_CLASS, targetClass);
    }

    public NodeShape(String targetClass) {
        this(
                targetClass.endsWith("Shape")
                        ? targetClass
                        : targetClass + "Shape",
                targetClass
        );
    }

    public String getShapeLabel() {
        return shapeLabel;
    }

    @Override
    public String toString() {
        return "NodeShape{"
                + parameters.entrySet().stream()
                .map(e -> "  " + e.getKey() + ": " + e.getValue() + "\n")
                .collect(Collectors.joining())
                + '}';

    }

}
