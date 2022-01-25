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

import io.fusion.fusionbackend.dto.FactorySiteDto;
import io.fusion.fusionbackend.model.FactorySite;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class FactorySiteMapper implements EntityDtoMapper<FactorySite, FactorySiteDto> {
    private final RoomMapper roomMapper;
    private final CountryMapper countryMapper;
    private final ShiftSettingsMapper shiftSettingsMapper;

    @Autowired
    public FactorySiteMapper(RoomMapper roomMapper,
                             CountryMapper countryMapper,
                             ShiftSettingsMapper shiftSettingsMapper) {
        this.roomMapper = roomMapper;
        this.countryMapper = countryMapper;
        this.shiftSettingsMapper = shiftSettingsMapper;
    }

    private FactorySiteDto toDtoShallow(final FactorySite entity) {
        if (entity == null) {
            return null;
        }
        FactorySiteDto dto = FactorySiteDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .type(entity.getType())
                .companyId(EntityDtoMapper.getEntityId(entity.getCompany()))
                .roomIds(EntityDtoMapper.getSetOfEntityIds(entity.getRooms()))
                .name(entity.getName())
                .line1(entity.getLine1())
                .line2(entity.getLine2())
                .city(entity.getCity())
                .zip(entity.getZip())
                .countryId(EntityDtoMapper.getEntityId(entity.getCountry()))
                .longitude(entity.getLongitude())
                .latitude(entity.getLatitude())
                .imageKey(entity.getImageKey())
                .shiftSettingsId(EntityDtoMapper.getEntityId(entity.getShiftSettings()))
                .build();

        if (entity.getCountry() != null) {
            dto.setCountry(countryMapper.toDto(entity.getCountry(), false));
        }

        return dto;
    }

    private FactorySiteDto toDtoDeep(final FactorySite entity) {
        if (entity == null) {
            return null;
        }

        FactorySiteDto dto = toDtoShallow(entity);

        dto.setCountry(countryMapper.toDto(entity.getCountry(), false));
        if (entity.hasShiftSettings()) {
            dto.setShiftSettings(shiftSettingsMapper.toDto(entity.getShiftSettings(), true));
        }

        return dto;
    }

    @Override
    public FactorySiteDto toDto(FactorySite entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public FactorySite toEntity(FactorySiteDto dto) {
        if (dto == null) {
            return null;
        }
        final FactorySite entity = FactorySite.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .type(dto.getType())
                .name(dto.getName())
                .line1(dto.getLine1())
                .line2(dto.getLine2())
                .city(dto.getCity())
                .zip(dto.getZip())
                .longitude(dto.getLongitude())
                .latitude(dto.getLatitude())
                .build();

        if (dto.getRooms() != null) {
            entity.setRooms(roomMapper.toEntitySet(dto.getRooms()));
        }
        if (dto.getCountry() != null) {
            entity.setCountry(countryMapper.toEntity(dto.getCountry()));
        }
        if (dto.getShiftSettings() != null) {
            entity.setShiftSettings(shiftSettingsMapper.toEntity(dto.getShiftSettings()));
        }

        return entity;
    }

    @Override
    public Set<FactorySiteDto> toDtoSet(Set<FactorySite> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<FactorySite> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<FactorySite> toEntitySet(Set<FactorySiteDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
