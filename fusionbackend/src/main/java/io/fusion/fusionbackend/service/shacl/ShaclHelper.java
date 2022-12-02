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

import io.fusion.fusionbackend.model.Asset;

import java.util.Arrays;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

public class ShaclHelper {

    public interface LambdaWrapper<T> {
        void execute(T shape);
    }

    public static String createIriIfNeeded(String candidate, String defaultPrefix) {
        return isIri(candidate)
                ? escapeTurtleObjectName(candidate)
                : defaultPrefix + escapeTurtleObjectName(candidate);
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
        AtomicBoolean first = new AtomicBoolean(true);
        return Arrays.stream(object
                .replaceAll("[<\"'=;()>:?.*]", "")
                .replace(" ", "_")
                .split("_"))
                .map(fragment -> !first.getAndSet(false)
                        ? ShaclHelper.toCamelCase(fragment)
                        : fragment)
                .collect(Collectors.joining());
    }

    public static String toCamelCase(String fragment) {
        return fragment.length() > 1
                ? fragment.substring(0, 1).toUpperCase()
                + fragment.substring(1)
                : fragment;
    }

    public static String escapeChars(String charSequence, String text) {
        for (int i = 0; i < charSequence.length(); i++) {
            text = text.replace(Character.toString(charSequence.charAt(i)), "\\" + charSequence.charAt(i));
        }
        return text;
    }

    public static String createAssetIriWithSerial(Asset asset, String defaultPrefix) {
        return ShaclHelper.createIriIfNeeded(asset.getName(), defaultPrefix) + "-" + (
                asset.getSerialNumber() != null && !asset.getSerialNumber().isEmpty()
                        ? asset.getSerialNumber()
                        : asset.getGlobalId());

    }

    public static String createAssetIriId(Long id, Asset asset, String defaultPrefix) {
        return ShaclHelper.createAssetIriWithSerial(asset, defaultPrefix) + ":" + id;
    }
}
