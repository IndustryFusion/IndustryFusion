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

import io.fusion.fusionbackend.model.shacl.enums.BasicKeys;
import io.fusion.fusionbackend.model.shacl.enums.ShaclKeys;
import io.fusion.fusionbackend.model.shacl.enums.ShaclNodeKind;

import java.util.Map;

public class RelationshipShape extends ShaclShape {
    public RelationshipShape(ShaclNodeKind nodeKind, String path) {
        addParameter(ShaclKeys.PATH, path);
        addParameter(ShaclKeys.NODE_KIND, nodeKind.getPath());
    }

    public Map<BasicKeys, String> getParameters() {
        return parameters;
    }
}
