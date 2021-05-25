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

import io.fusion.fusionbackend.dto.AssetTypeDto;
import io.fusion.fusionbackend.model.AssetType;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AssetTypeMapper implements EntityDtoMapper<AssetType, AssetTypeDto> {
    private AssetTypeDto toDtoShallow(final AssetType entity) {
        if (entity == null) {
            return null;
        }

        return AssetTypeDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .label(entity.getLabel())
                .build();
    }

    private AssetTypeDto toDtoDeep(final AssetType entity) {
        return toDtoShallow(entity);
    }

    @Override
    public AssetTypeDto toDto(AssetType entity, boolean embedChildren) {
        return toDtoShallow(entity);
    }

    @Override
    public AssetType toEntity(AssetTypeDto dto) {
        if (dto == null) {
            return null;
        }

        return AssetType.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .label(dto.getLabel())
                .build();
    }

    @Override
    public Set<AssetTypeDto> toDtoSet(Set<AssetType> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<AssetType> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<AssetType> toEntitySet(Set<AssetTypeDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
