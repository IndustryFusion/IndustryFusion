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

package io.fusion.fusionbackend.service.shacl;

import io.fusion.fusionbackend.model.shacl.ShaclShape;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.io.OutputStream;
import java.util.Set;

@UtilityClass
@Slf4j
public class ShaclUtil {

    public void writeShaclShapeToStream(ShaclShape shape, ShaclPrefixes prefixes, OutputStream outputStream) {
        ShaclWriter.out(
                outputStream,
                shape,
                prefixes
        );
    }

    public void writeShaclShapeToStream(Set<ShaclShape> shapes, ShaclPrefixes prefixes, OutputStream outputStream) {
        ShaclWriter.out(
                outputStream,
                shapes,
                prefixes
        );
    }

}
