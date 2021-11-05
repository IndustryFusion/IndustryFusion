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
import io.fusion.fusionbackend.model.enums.FactorySiteType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

import java.util.LinkedHashSet;
import java.util.Set;

@EqualsAndHashCode(callSuper = true)
@Data
@SuperBuilder
@AllArgsConstructor
public class FactorySiteDto extends BaseEntityDto {
    private Long companyId;

    @Builder.Default
    private Set<Long> roomIds = new LinkedHashSet<>();
    @Builder.Default
    private Set<RoomDto> rooms = new LinkedHashSet<>();

    private String name;
    private String line1;
    private String line2;
    private String city;
    private String zip;

    private Long countryId;
    private CountryDto country;

    private Double latitude;
    private Double longitude;
    private String imageKey;
    private FactorySiteType type;

    @JsonCreator
    public FactorySiteDto() {
    }
}
