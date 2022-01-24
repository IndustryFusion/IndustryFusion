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

import io.fusion.fusionbackend.dto.ShiftsOfDayDto;
import io.fusion.fusionbackend.model.Shift;
import io.fusion.fusionbackend.model.ShiftsOfDay;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ShiftsOfDayMapper implements EntityDtoMapper<ShiftsOfDay, ShiftsOfDayDto> {

    private final ShiftMapper shiftMapper;

    @Autowired
    public ShiftsOfDayMapper(ShiftMapper shiftMapper) {
        this.shiftMapper = shiftMapper;
    }

    private ShiftsOfDayDto toDtoShallow(final ShiftsOfDay entity) {
        if (entity == null) {
            return null;
        }

        return ShiftsOfDayDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .day(entity.getDay())
                .isActive(entity.getIsActive())
                .shiftIds(EntityDtoMapper.getSetOfEntityIds(entity.getShifts())
                        .stream().sorted().collect(Collectors.toCollection(LinkedHashSet::new)))
                .build();
    }

    private ShiftsOfDayDto toDtoDeep(final ShiftsOfDay entity) {
        ShiftsOfDayDto dto = toDtoShallow(entity);
        if (dto == null) {
            return null;
        }

        if (entity.getShifts() != null) {
            dto.setShifts(this.shiftMapper.toDtoSet(entity.getShifts()
                    .stream().sorted(Comparator.comparing(Shift::getId))
                    .collect(Collectors.toCollection(LinkedHashSet::new)), true));
        }

        return dto;
    }

    @Override
    public ShiftsOfDayDto toDto(ShiftsOfDay entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public ShiftsOfDay toEntity(ShiftsOfDayDto dto) {
        if (dto == null) {
            return null;
        }
        ShiftsOfDay entity = ShiftsOfDay.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .day(dto.getDay())
                .isActive(dto.getIsActive())
                .build();

        if (dto.getShifts() != null) {
            entity.setShifts(shiftMapper.toEntitySet(dto.getShifts()));
        }

        return entity;
    }

    @Override
    public Set<ShiftsOfDayDto> toDtoSet(Set<ShiftsOfDay> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<ShiftsOfDay> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<ShiftsOfDay> toEntitySet(Set<ShiftsOfDayDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
