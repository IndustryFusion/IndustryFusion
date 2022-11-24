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

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class ShaclPrefixes {

    private final Map<String, String> prefixes = new HashMap<>();

    public ShaclPrefixes addPrefix(String ns, String uri) {
        prefixes.put(ns, uri);
        return this;
    }

    public ShaclPrefixes addPrefix(Map<String, String> prefixes) {
        if (prefixes != null) {
            this.prefixes.putAll(prefixes);
        }
        return this;
    }

    private static Optional<String> checkIriAndReturn(String candidate) {
        return Optional.ofNullable(ShaclMapper.isIri(candidate) ? candidate : null);
    }

    public String checkAndFormatIri(String candidate) {
        for (Map.Entry<String, String> prefix : prefixes.entrySet()) {
            if (candidate.startsWith(prefix.getValue())
                    && !candidate.substring(prefix.getValue().length()).contains("/")
                    && !candidate.substring(prefix.getValue().length()).contains("#")
            ) {
                return prefix.getKey()
                        + ":"
                        + ShaclMapper.escapeTurtleObjectName(candidate.substring(prefix.getValue().length()));
            }
        }
        for (Map.Entry<String, String> prefix : prefixes.entrySet()) {
            if (candidate.startsWith(prefix.getKey() + ":")) {
                return candidate;
            }
        }
        return checkIriAndReturn(candidate).map(iri -> "<" + candidate + ">").orElse(candidate);
    }


    public void writePrefixesAsShacl(PrintWriter printWriter) {
        for (Map.Entry<String, String> prefix : prefixes.entrySet()) {
            printWriter.println("@prefix " + prefix.getKey() + ": <" + prefix.getValue() + "> .");
        }
    }

    public static ShaclPrefixes getDefaultPrefixes() {
        return new ShaclPrefixes()
                .addPrefix("dash", "http://datashapes.org/dash#")
                .addPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#")
                .addPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#")
                .addPrefix("schema", "http://schema.org/");
    }

}
