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
import io.fusion.fusionbackend.service.shacl.ShaclPrefixes;
import org.apache.commons.lang3.NotImplementedException;

import java.io.PrintWriter;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.stream.Collectors;

public abstract class ShaclShape {

    protected static final String DEFAULT_INDENTATION = "    ";
    protected final Map<BasicKeys, String> parameters = new HashMap<>();
    protected final Collection<ShaclShape> subShapes = new HashSet<>();

    public ShaclShape addParameter(BasicKeys parameter, String value) {
        if (value != null) {
            parameters.put(parameter, value);
        }
        return this;
    }

    public ShaclShape addParameter(BasicKeys parameter, Integer value) {
        if (value != null) {
            parameters.put(parameter, Integer.toString(value));
        }
        return this;
    }

    public ShaclShape addParameter(BasicKeys parameter, Long value) {
        if (value != null) {
            parameters.put(parameter, Long.toString(value));
        }
        return this;
    }

    public ShaclShape addParameter(BasicKeys parameter, Double value) {
        if (value != null) {
            parameters.put(parameter, Double.toString(value));
        }
        return this;
    }

    public ShaclShape addParameter(BasicKeys parameter, Boolean value) {
        if (value != null) {
            parameters.put(parameter, Boolean.toString(value));
        }
        return this;
    }

    public ShaclShape addSubShape(ShaclShape shape) {
        if (shape != null) {
            subShapes.add(shape);
        }
        return this;
    }

    public ShaclShape addSubShapes(Collection<ShaclShape> map) {
        subShapes.addAll(map);
        return this;
    }

    public Collection<ShaclShape> getSubShapes() {
        return subShapes;
    }

    private void resolveParametersAndSubShapes(PrintWriter printWriter, ShaclPrefixes prefixes, String indentation) {
        parameters.entrySet().stream()
                .sorted(Comparator.comparing(parameter -> parameter.getKey().getPath())
                ).forEach(parameter -> printWriter.println(
                indentation
                        + DEFAULT_INDENTATION
                        + prefixes.checkAndFormatIri(parameter.getKey().getPath())
                        + " " + prefixes.checkAndFormatIri(parameter.getValue())
                        + " ;"
                )
        );
        subShapes.stream()
                .sorted(Comparator.comparing(parameter -> parameter.getIntParameter(ShaclKeys.ORDER)))
                .forEach(subShape -> subShape.writeNodeAsShacl(printWriter,
                        prefixes, indentation + DEFAULT_INDENTATION + DEFAULT_INDENTATION));
    }

    public void writeNodeAsShacl(PrintWriter printWriter, ShaclPrefixes prefixes, String indentation) {
        if (this instanceof NodeShape) {
            printWriter.println(indentation
                    + prefixes.checkAndFormatIri(((NodeShape) this).getShapeLabel())
                    + " a sh:NodeShape ;"
            );
            resolveParametersAndSubShapes(printWriter, prefixes, indentation);
            printWriter.println(".");
        } else if (this instanceof PropertyShape || this instanceof RelationshipShape) {
            printWriter.println(indentation
                    + "sh:property ["
            );
            resolveParametersAndSubShapes(printWriter, prefixes, indentation);
            printWriter.println(indentation + "] ;");
        } else {
            throw new NotImplementedException("Not implemented shape class type");
        }
    }

    @Override
    public String toString() {
        return "ShaclShape{"
                + parameters.entrySet().stream()
                .map(e -> "  " + e.getKey() + ": " + e.getValue() + "\n")
                .collect(Collectors.joining())
                + '}';
    }

    public Integer getIntParameter(BasicKeys parameter) {
        return getIntParameter(parameter, -1);
    }

    public Integer getIntParameter(BasicKeys parameter, Integer defaultValue) {
        return Integer.parseInt(parameters.getOrDefault(parameter, Integer.toString(defaultValue)));
    }

    public String getStringParameter(BasicKeys parameter) {
        return getStringParameter(parameter, "");
    }

    public String getStringParameter(BasicKeys parameter, String defaultValue) {
        String value = parameters.getOrDefault(parameter, defaultValue);
        return value == null ? null : value.replaceAll("^\"(.*)\"$", "$1");
    }

    public boolean containsParameter(BasicKeys parameter) {
        return parameters.containsKey(parameter);
    }

    public Double getDoubleParameter(BasicKeys parameter, Double defaultValue) {
        return Double.parseDouble(parameters.getOrDefault(parameter, Double.toString(defaultValue)));
    }

    public Double getDoubleParameter(BasicKeys parameter) {
        return getDoubleParameter(parameter, 0.0);
    }


}
