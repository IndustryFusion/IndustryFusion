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

import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.model.shacl.enums.NameSpaces;

import java.net.URL;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class ShaclHelper {

    public static String createFieldIri(Field field) {
        if (isIri(field.getName())) {
            return field.getName();
        } else {
            return NameSpaces.FIELD.getPath() + escapeTurtleObjectName(field.getName());
        }
    }

    public static String createUnitIri(Unit unit) {
        return NameSpaces.UNIT.getPath() + toCamelCase(escapeTurtleObjectName(unit.getName()));
    }

    public static String createAssetTypeIri(AssetType assetType) {
        if (isIri(assetType.getName())) {
            return assetType.getName();
        } else {
            return NameSpaces.ASSET_TYPE.getPath() + escapeTurtleObjectName(assetType.getName());
        }
    }

    public interface LambdaWrapper<T> {
        void execute(T shape);
    }

    public static String createHasClassIri(String name) {
        if (isIri(name)) {
            String strippedName = stripRdfClassFromIri(name);
            return NameSpaces.FIELD.getPath() + "has" + strippedName;
        } else {
            return NameSpaces.FIELD.getPath() + "has" + toCamelCase(escapeTurtleObjectName(name));
        }
    }

    public static String createClassIri(String name) {
        if (isIri(name)) {
            return name;
        } else {
            return NameSpaces.IF.getPath() + toCamelCase(escapeTurtleObjectName(name));
        }
    }

    public static String createIriIfNeeded(String candidate) {
        return isIri(candidate)
                ? candidate
                : NameSpaces.IF.getPath() + escapeTurtleObjectName(candidate);
    }

    public static boolean isIri(String candidate) {
        return candidate.toLowerCase().startsWith("http://") || candidate.toLowerCase().startsWith("https://");
    }

    public static String toValidText(String text) {
        return text == null ? null : "\"" + escapeTurtleStrings(text) + "\"";
    }

    public static String escapeTurtleStrings(String text) {
        return escapeChars("\"\\", text);
    }

    public static String escapeTurtleObjectName(String object) {
        //return toCamelCase(object.replaceAll("[<\"'=;()>:?.*]", "").replaceAll("_", " "));
        return object.replaceAll("[<\"'=;()>:?.*]", "").replaceAll("_", " ");
    }

    public static String toCamelCase(String value) {
        return Arrays.stream(value.split(" "))
                .map(fragment -> fragment.length() > 1
                        ? fragment.substring(0, 1).toUpperCase()
                        + fragment.substring(1)
                        : fragment)
                .collect(Collectors.joining());
    }

    public static String escapeChars(String charSequence, String text) {
        for (int i = 0; i < charSequence.length(); i++) {
            text = text.replace(Character.toString(charSequence.charAt(i)), "\\" + charSequence.charAt(i));
        }
        return text;
    }

    public static Set<AssetType> findAssetTypeDependencies(Set<AssetTypeTemplate> assetTypeTemplates) {
        Set<Long> keys = new HashSet<>();
        Set<AssetType> assets = new HashSet<>();
        assetTypeTemplates
                .forEach(att -> {
                    if (!keys.contains(att.getAssetType().getId())) {
                        assets.add(att.getAssetType());
                    }
                    findAssetTypeDependencies(att.getSubsystems()).forEach(atts -> {
                                if (!keys.contains(atts.getId())) {
                                    assets.add(att.getAssetType());
                                }
                            }
                    );
                });
        return assets;
    }

    public static Set<AssetTypeTemplate> findAssetSeriesDependencies(Set<AssetSeries> assetSeries) {
        Set<Long> ids = new HashSet<>();
        return assetSeries.stream()
                .map(AssetSeries::getAssetTypeTemplate)
                .filter(s -> !ids.contains(s.getId()))
                .peek(s -> ids.add(s.getId()))
                .collect(Collectors.toSet());
    }


    public static Set<Field> findFieldDependencies(Set<AssetTypeTemplate> assetTypeTemplate) {
        Set<Long> ids = new HashSet<>();
        return assetTypeTemplate.stream()
                .map(AssetTypeTemplate::getFieldTargets)
                .flatMap(Collection::stream)
                .map(FieldTarget::getField)
                .filter(f -> !ids.contains(f.getId()))
                .peek(f -> ids.add(f.getId()))
                .collect(Collectors.toSet());
    }

    public static Set<Field> findFieldDependencies(AssetTypeTemplate assetTypeTemplate) {
        Set<AssetTypeTemplate> templates = new HashSet<>();
        templates.add(assetTypeTemplate);
        return findFieldDependencies(templates);
    }

    public static Set<Unit> findUnitDependencies(Set<Field> fields) {
        Set<Long> keys = new HashSet<>();
        Set<Unit> units = new HashSet<>();
        fields
                .forEach(field -> {
                    if (field.getUnit() != null && !keys.contains(field.getUnit().getId())) {
                        units.add(field.getUnit());
                    }
                });
        return units;
    }

    public static <T> Set<T> asSet(T t) {
        Set<T> ts = new HashSet<>();
        ts.add(t);
        return ts;
    }

    public static String stripRdfClassFromIri(String iri) {
        String result = null;
        try {
            URL url = new URL(iri);

            String path = url.getPath();
            int lastslash = path.lastIndexOf('/');
            result = (lastslash == -1) ? path : path.substring(lastslash + 1);
            if (url.getRef() != null) {
                result = url.getRef();
            }
        } catch (Exception e) {
            System.out.println("Caught: " + e.getMessage());
            result = "";
        }
        return result;
    }


}
