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

public enum IfsPaths implements BasicPaths {

    VERSION(IfsPaths.BASE_PATH + "version"),
    FIELD_TYPE(IfsPaths.BASE_PATH + "fieldType"),
    FIELD_UNIT(IfsPaths.BASE_PATH + "unit"),
    FIELD_NAME(IfsPaths.BASE_PATH + "name"),
    FIELD_DESCRIPTION(IfsPaths.BASE_PATH + "description"),
    FIELD_LABEL(IfsPaths.BASE_PATH + "label"),
    FIELD_ACCURACY(IfsPaths.BASE_PATH + "accuracy"),
    CREATION_DATE(IfsPaths.BASE_PATH + "creationDate"),
    FIELD_OPTIONS(IfsPaths.BASE_PATH + "fieldOptions"),
    FIELD_WIDGET_TYPE(IfsPaths.BASE_PATH + "widgetType"),
    FIELD_DASHBOARD_GROUP(IfsPaths.BASE_PATH + "dashboardGroup"),
    FIELD_THRESHOLD_TYPE(IfsPaths.BASE_PATH + "thresholdType"),
    ASSET_TYPE_NAME(IfsPaths.BASE_PATH + "assetTypeName"),
    ASSET_TYPE_LABEL(IfsPaths.BASE_PATH + "assetTypeLabel"),
    ASSET_TYPE_VERSION(IfsPaths.BASE_PATH + "assetTypeVersion"),
    ASSET_SERIES_NAME(IfsPaths.BASE_PATH + "assetSeriesName"),
    ASSET_SERIES_DESCRIPTION(IfsPaths.BASE_PATH + "assetSeriesDescription"),
    CONNECTIVITY_TYPE(IfsPaths.BASE_PATH + "connectivityType"),
    CONNECTIVITY_PROTOCOL(IfsPaths.BASE_PATH + "connectivityProtocol"),
    CONNECTION_STRING(IfsPaths.BASE_PATH + "ConnectionString"),
    CE_CERTIFICATION(IfsPaths.BASE_PATH + "ceCertification"),
    PROTECTION_CLASS(IfsPaths.BASE_PATH + "protectionClass"),
    ASSET_MANUAL(IfsPaths.BASE_PATH + "assetManual"),
    ASSET_VIDEO(IfsPaths.BASE_PATH + "assetVideo"),
    DATA_SOURCE(IfsPaths.BASE_PATH + "dataSource"),
    CUSTOM_SCRIPT(IfsPaths.BASE_PATH + "customScript"),
    GLOBAL_ID(IfsPaths.BASE_PATH + "globalId"),
    REGISTER(IfsPaths.BASE_PATH + "register"),
    CONSTRUCTION_DATE(IfsPaths.BASE_PATH + "constructionDate"),
    INSTALLATION_DATE(IfsPaths.BASE_PATH + "installationDate"),
    SERIAL_NUMBER(IfsPaths.BASE_PATH + "serialNumber"),
    IDEAL_THRESHOLD_UPPER(IfsPaths.BASE_PATH + "idealThresholdUpper"),
    IDEAL_THRESHOLD_LOWER(IfsPaths.BASE_PATH + "idealThresholdLower"),
    ABSOLUTE_THRESHOLD_UPPER(IfsPaths.BASE_PATH + "absoluteThresholdUpper"),
    ABSOLUTE_THRESHOLD_LOWER(IfsPaths.BASE_PATH + "absoluteThresholdLower"),
    CRITICAL_THRESHOLD_UPPER(IfsPaths.BASE_PATH + "criticalThresholdUpper"),
    CRITICAL_THRESHOLD_LOWER(IfsPaths.BASE_PATH + "criticalThresholdLower");

    private final String path;

    public static final String BASE_PATH = "https://www.industry-fusion.com/types#";

    @Override
    public String getPath() {
        return path;
    }

    IfsPaths(String path) {
        this.path = path;
    }

    public static Optional<IfsPaths> asEnum(String uri) {
        return Arrays.stream(IfsPaths.values())
                .filter(candidate -> candidate.getPath().equalsIgnoreCase(uri)).findAny();
    }

}
