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
import io.fusion.fusionbackend.model.enums.PublicationState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@AllArgsConstructor
public class AssetTypeTemplateDto extends BaseAssetDto {
    private Long assetTypeId;
    private AssetTypeDto assetType;
    private PublicationState publicationState;
    private OffsetDateTime publishedDate;
    private Long publishedVersion;

    @Builder.Default
    protected Set<Long> fieldTargetIds = new LinkedHashSet<>();
    @Builder.Default
    protected Set<FieldTargetDto> fieldTargets = new LinkedHashSet<>();

    @JsonCreator
    public AssetTypeTemplateDto() {
    }
}
