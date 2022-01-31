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

import io.fusion.fusionbackend.dto.ShiftSettingsDto;
import io.fusion.fusionbackend.dto.ShiftsOfDayDto;
import io.fusion.fusionbackend.model.ShiftSettings;
import io.fusion.fusionbackend.model.ShiftsOfDay;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ShiftSettingsMapper implements EntityDtoMapper<ShiftSettings, ShiftSettingsDto> {

    private final ShiftsOfDayMapper shiftsOfDayMapper;

    @Autowired
    public ShiftSettingsMapper(ShiftsOfDayMapper shiftsOfDayMapper) {
        this.shiftsOfDayMapper = shiftsOfDayMapper;
    }

    private ShiftSettingsDto toDtoShallow(final ShiftSettings entity) {
        if (entity == null) {
            return null;
        }
        
        return ShiftSettingsDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .factorySiteId(entity.getFactorySite().getId())
                .weekStart(entity.getWeekStart())
                .shiftsOfDayIds(EntityDtoMapper.getSetOfEntityIds(entity.getShiftsOfDays())
                        .stream().sorted().collect(Collectors.toCollection(LinkedHashSet::new)))
                .build();
    }

    private ShiftSettingsDto toDtoDeep(final ShiftSettings entity) {
        ShiftSettingsDto dto = toDtoShallow(entity);
        if (dto == null) {
            return null;
        }

        if (entity.getShiftsOfDays() != null) {
            dto.setShiftsOfDays(this.shiftsOfDayMapper.toDtoSet(entity.getShiftsOfDays()
                    .stream().sorted(Comparator.comparing(ShiftsOfDay::getDay))
                    .collect(Collectors.toCollection(LinkedHashSet::new)), true));
        }

        return dto;
    }

    @Override
    public ShiftSettingsDto toDto(ShiftSettings entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public ShiftSettings toEntity(ShiftSettingsDto dto) {
        if (dto == null) {
            return null;
        }
        ShiftSettings entity = ShiftSettings.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .weekStart(dto.getWeekStart())
                .build();

        if (dto.getShiftsOfDays() != null) {
            entity.setShiftsOfDays(shiftsOfDayMapper.toEntitySet(dto.getShiftsOfDays()
                    .stream().sorted(Comparator.comparing(ShiftsOfDayDto::getDay))
                    .collect(Collectors.toCollection(LinkedHashSet::new))));
        }

        return entity;
    }

    @Override
    public Set<ShiftSettingsDto> toDtoSet(Set<ShiftSettings> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<ShiftSettings> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<ShiftSettings> toEntitySet(Set<ShiftSettingsDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
