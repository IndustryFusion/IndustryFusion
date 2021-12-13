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

package io.fusion.fusionbackend.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import io.fusion.fusionbackend.model.enums.FieldDataType;
import io.fusion.fusionbackend.model.enums.FieldThresholdType;
import io.fusion.fusionbackend.model.enums.FieldWidgetType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;

@EqualsAndHashCode(callSuper = true)
@Data
@SuperBuilder
@AllArgsConstructor
public class FieldDto extends BaseEntityDto {
    private String name;
    private String description;
    private String label;
    private Double accuracy;
    private String value;
    private Long unitId;
    private UnitDto unit;
    private FieldThresholdType thresholdType;
    private FieldWidgetType widgetType;
    private OffsetDateTime creationDate;
    private FieldDataType dataType;
    private LinkedHashSet<FieldOptionDto> enumOptions;

    @JsonCreator
    public FieldDto() {
    }
}
