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

package io.fusion.fusionbackend.dto.mappers;

import io.fusion.fusionbackend.dto.AssetTypeDetailsDto;
import io.fusion.fusionbackend.model.AssetType;
import org.springframework.stereotype.Component;

@Component
public class AssetTypeDetailsMapper {

    public AssetTypeDetailsMapper() {
    }

    private AssetTypeDetailsDto toDtoShallow(final AssetType entity,
                                             final long templateCount,
                                             final long assetSeriesCount,
                                             final long assetCount) {
        if (entity == null) {
            return null;
        }

        return AssetTypeDetailsDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .name(entity.getName())
                .description(entity.getDescription())
                .label(entity.getLabel())
                .version(entity.getVersion())
                .templateCount(templateCount)
                .assetSeriesCount(assetSeriesCount)
                .assetCount(assetCount)
                .build();
    }

    public AssetTypeDetailsDto toDto(AssetType entity,
                                     final long templateCount,
                                     final long assetSeriesCount,
                                     final long assetCount) {
        return toDtoShallow(entity, templateCount, assetSeriesCount, assetCount);
    }
}
