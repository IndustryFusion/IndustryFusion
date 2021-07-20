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
import io.fusion.fusionbackend.model.enums.CompanyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.SuperBuilder;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@SuperBuilder
@AllArgsConstructor
public class CompanyDto {
    private Long id;

    @Builder.Default
    private Set<Long> factorySiteIds = new LinkedHashSet<>();
    @Builder.Default
    private Set<FactorySiteDto> factorySites = new LinkedHashSet<>();

    @Builder.Default
    private Set<Long> assetIds = new LinkedHashSet<>();
    @Builder.Default
    private Set<AssetDto> assets = new LinkedHashSet<>();

    private String name;
    private String description;
    private String imageKey;
    private CompanyType type;

    @JsonCreator
    public CompanyDto() {
    }
}
