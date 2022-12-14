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

public enum IfsKeys implements BasicKeys {

    VERSION(NameSpaces.IF.getPath() + "version"),
    FIELD_TYPE(NameSpaces.IF.getPath() + "fieldType"),
    CREATION_DATE(NameSpaces.IF.getPath() + "creationDate"),
    FIELD_DASHBOARD_GROUP(NameSpaces.IF.getPath() + "dashboardGroup"),
    CONNECTIVITY_TYPE(NameSpaces.IF.getPath() + "connectivityType"),
    CONNECTIVITY_PROTOCOL(NameSpaces.IF.getPath() + "connectivityProtocol"),
    CONNECTION_STRING(NameSpaces.IF.getPath() + "ConnectionString"),
    CE_CERTIFICATION(NameSpaces.IF.getPath() + "ceCertification"),
    PROTECTION_CLASS(NameSpaces.IF.getPath() + "protectionClass"),
    ASSET_MANUAL(NameSpaces.IF.getPath() + "assetManual"),
    ASSET_VIDEO(NameSpaces.IF.getPath() + "assetVideo"),
    CUSTOM_SCRIPT(NameSpaces.IF.getPath() + "customScript"),
    REGISTER(NameSpaces.IF.getPath() + "register"),
    CONSTRUCTION_DATE(NameSpaces.IF.getPath() + "constructionDate"),
    INSTALLATION_DATE(NameSpaces.IF.getPath() + "installationDate"),
    SERIAL_NUMBER(NameSpaces.IF.getPath() + "serialNumber"),
    IDEAL_THRESHOLD_UPPER(NameSpaces.IF.getPath() + "idealThresholdUpper"),
    IDEAL_THRESHOLD_LOWER(NameSpaces.IF.getPath() + "idealThresholdLower"),
    ABSOLUTE_THRESHOLD_UPPER(NameSpaces.IF.getPath() + "absoluteThresholdUpper"),
    ABSOLUTE_THRESHOLD_LOWER(NameSpaces.IF.getPath() + "absoluteThresholdLower"),
    CRITICAL_THRESHOLD_UPPER(NameSpaces.IF.getPath() + "criticalThresholdUpper"),
    CRITICAL_THRESHOLD_LOWER(NameSpaces.IF.getPath() + "criticalThresholdLower"),
    PUBLISHED_DATE(NameSpaces.IF.getPath() + "publishedDate"),
    PUBLICATION_STATE(NameSpaces.IF.getPath() + "publicationDate"),
    METRIC_DATATYPE(NameSpaces.IF.getPath() + "metricDataType"),
    PUBLISHED_VERSION(NameSpaces.IF.getPath() + "publishedVersion"),
    DEFAULT(NameSpaces.IF.getPath() + "default"),
    ASSET_TYPE_TEMPLATE(NameSpaces.IF.getPath() + "assetTypeTemplate"),
    FIELD(NameSpaces.IF.getPath() + "field"),
    VALUE(NameSpaces.IF.getPath() + "value"),
    ASSET_TYPE(NameSpaces.IF.getPath() + "assetType");

    private final String path;

    @Override
    public String getPath() {
        return path;
    }

    IfsKeys(String path) {
        this.path = path;
    }

    public static Optional<IfsKeys> asEnum(String uri) {
        return Arrays.stream(IfsKeys.values())
                .filter(candidate -> candidate.getPath().equalsIgnoreCase(uri)).findAny();
    }

    public static boolean containsPath(String path) {
        return Arrays.stream(IfsKeys.values())
                .map(IfsKeys::getPath)
                .anyMatch(path::equalsIgnoreCase);

    }

}
