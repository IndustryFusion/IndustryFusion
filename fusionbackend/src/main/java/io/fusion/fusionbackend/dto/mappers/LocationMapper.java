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

import io.fusion.fusionbackend.dto.LocationDto;
import io.fusion.fusionbackend.model.Location;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class LocationMapper implements EntityDtoMapper<Location, LocationDto> {
    private final RoomMapper roomMapper;

    @Autowired
    public LocationMapper(RoomMapper roomMapper) {
        this.roomMapper = roomMapper;
    }

    private LocationDto toDtoShallow(final Location entity) {
        if (entity == null) {
            return null;
        }
        return LocationDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .companyId(EntityDtoMapper.getEntityId(entity.getCompany()))
                .roomIds(EntityDtoMapper.getSetOfEntityIds(entity.getRooms()))
                .name(entity.getName())
                .line1(entity.getLine1())
                .line2(entity.getLine2())
                .city(entity.getCity())
                .zip(entity.getZip())
                .country(entity.getCountry())
                .longitude(entity.getLongitude())
                .latitude(entity.getLatitude())
                .imageKey(entity.getImageKey())
                .build();
    }

    private LocationDto toDtoDeep(final Location entity) {
        if (entity == null) {
            return null;
        }
        return LocationDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .companyId(EntityDtoMapper.getEntityId(entity.getCompany()))
                .rooms(roomMapper.toDtoSet(entity.getRooms()))
                .name(entity.getName())
                .line1(entity.getLine1())
                .line2(entity.getLine2())
                .city(entity.getCity())
                .zip(entity.getZip())
                .country(entity.getCountry())
                .longitude(entity.getLongitude())
                .latitude(entity.getLatitude())
                .imageKey(entity.getImageKey())
                .build();
    }

    @Override
    public LocationDto toDto(Location entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public Location toEntity(LocationDto dto) {
        if (dto == null) {
            return null;
        }
        return Location.builder()
                .id(dto.getId())
                .type(dto.getType())
                .name(dto.getName())
                .line1(dto.getLine1())
                .line2(dto.getLine2())
                .city(dto.getCity())
                .zip(dto.getZip())
                .country(dto.getCountry())
                .longitude(dto.getLongitude())
                .latitude(dto.getLatitude())
                .build();
    }

    @Override
    public Set<LocationDto> toDtoSet(Set<Location> entitySet) {
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<Location> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<Location> toEntitySet(Set<LocationDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
