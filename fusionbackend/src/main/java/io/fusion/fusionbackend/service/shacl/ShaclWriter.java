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
import io.fusion.fusionbackend.model.shacl.enums.ShaclPaths;

import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.Comparator;
import java.util.Set;

public class ShaclWriter {

    public static void out(OutputStream outputStream, ShaclShape shape, ShaclPrefixes prefixes) {
        try (PrintWriter printWriter = new PrintWriter(outputStream)) {
            prefixes.writePrefixesAsShacl(printWriter);
            printWriter.println("\n");
            shape.writeNodeAsShacl(printWriter, prefixes, "");
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    public static void out(OutputStream outputStream, Set<ShaclShape> shapes, ShaclPrefixes prefixes) {
        try (PrintWriter printWriter = new PrintWriter(outputStream)) {
            prefixes.writePrefixesAsShacl(printWriter);
            printWriter.println("\n");
            shapes.stream()
                    .sorted(Comparator.comparing(
                            shape -> shape.getStringParameter(ShaclPaths.NAME))
                    )
                    .forEach(shape -> shape.writeNodeAsShacl(printWriter, prefixes, ""));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

}
