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

import io.fusion.fusionbackend.dto.ShiftDto;
import io.fusion.fusionbackend.model.Shift;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ShiftMapper implements EntityDtoMapper<Shift, ShiftDto> {

    @Autowired
    public ShiftMapper() {
    }

    private ShiftDto toDtoShallow(final Shift entity) {
        if (entity == null) {
            return null;
        }

        return ShiftDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .name(entity.getName())
                .startMinutes(entity.getStartMinutes())
                .endMinutes(entity.getEndMinutes())
                .build();
    }

    private ShiftDto toDtoDeep(final Shift entity) {
        return toDtoShallow(entity);
    }

    @Override
    public ShiftDto toDto(Shift entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public Shift toEntity(ShiftDto dto) {
        if (dto == null) {
            return null;
        }
        return Shift.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .name(dto.getName())
                .startMinutes(dto.getStartMinutes())
                .endMinutes(dto.getEndMinutes())
                .build();
    }
    
    @Override
    public Set<ShiftDto> toDtoSet(Set<Shift> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<Shift> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<Shift> toEntitySet(Set<ShiftDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
