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


import io.fusion.fusionbackend.dto.AssetSeriesDetailsDto;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.BaseAsset;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Set;

@Component
public class AssetSeriesDetailsMapper extends EntityDetailsDtoMapper<AssetSeries, AssetSeriesDetailsDto> {

    protected AssetSeriesDetailsDto toDtoDeep(AssetSeries entity) {
        if (entity == null) {
            return null;
        }

        Optional<AssetTypeTemplate> assetTypeTemplate = Optional.of(entity.getAssetTypeTemplate());
        AssetType assetType = assetTypeTemplate.map(AssetTypeTemplate::getAssetType).orElse(null);
        int assetCount = Optional.of(entity).map(AssetSeries::getAssets).map(Set::size).orElse(0);

        return AssetSeriesDetailsDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .name(entity.getName())
                .assetType(assetTypeTemplate.map(BaseAsset::getName).orElse(""))
                .templateVersion("000")
                .status("Active")
                .assetCount((long) assetCount)
                .imageKey(entity.getImageKey())
                .manufacturer(entity.getCompany().getName())
                .category(assetType.getDescription())
                .companyId(entity.getCompany().getId())
                .build();
    }

    @Override
    public Set<Long> toEntityIdSet(Set<AssetSeries> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }
}
