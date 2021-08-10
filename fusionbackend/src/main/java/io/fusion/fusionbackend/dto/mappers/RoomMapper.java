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

import io.fusion.fusionbackend.dto.RoomDto;
import io.fusion.fusionbackend.model.Room;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class RoomMapper implements EntityDtoMapper<Room, RoomDto> {
    private final AssetMapper assetMapper;
    private final FactorySiteMapper factorySiteMapper;

    @Autowired
    public RoomMapper(AssetMapper assetMapper, @Lazy FactorySiteMapper factorySiteMapper) {
        this.assetMapper = assetMapper;
        this.factorySiteMapper = factorySiteMapper;
    }

    private RoomDto toDtoShallow(final Room entity) {
        if (entity == null) {
            return null;
        }
        return RoomDto.builder()
                .id(entity.getId())
                .factorySiteId(EntityDtoMapper.getEntityId(entity.getFactorySite()))
                .assetIds(EntityDtoMapper.getSetOfEntityIds(entity.getAssets()))
                .name(entity.getName())
                .imageKey(entity.getImageKey())
                .description(entity.getDescription())
                .build();
    }

    private RoomDto toDtoDeep(final Room entity) {
        if (entity == null) {
            return null;
        }
        return RoomDto.builder()
                .id(entity.getId())
                .factorySite(factorySiteMapper.toDto(entity.getFactorySite(), false))
                .assets(assetMapper.toDtoSet(entity.getAssets(), false))
                .name(entity.getName())
                .imageKey(entity.getImageKey())
                .description(entity.getDescription())
                .build();
    }

    @Override
    public RoomDto toDto(Room entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public Room toEntity(RoomDto dto) {
        if (dto == null) {
            return null;
        }
        final Room entity = Room.builder()
                .id(dto.getId())
                .name(dto.getName())
                .imageKey(dto.getImageKey())
                .description(dto.getDescription())
                .build();

        if (dto.getFactorySite() != null) {
            entity.setFactorySite(factorySiteMapper.toEntity(dto.getFactorySite()));
        }

        return entity;
    }

    @Override
    public Set<RoomDto> toDtoSet(Set<Room> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<Room> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<Room> toEntitySet(Set<RoomDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
