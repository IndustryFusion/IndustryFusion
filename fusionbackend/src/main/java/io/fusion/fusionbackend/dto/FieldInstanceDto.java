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
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
public class FieldInstanceDto {
    private Long id;
    private Long assetId;
    private Long fieldSourceId;
    private FieldSourceDto fieldSource;
    private String name;
    private String description;
    private String externalId;
    private String sourceSensorLabel;
    private String value;
    private Long absoluteThresholdId;
    private Long idealThresholdId;
    private Long criticalThresholdId;

    @JsonCreator
    public FieldInstanceDto() {
    }
}
