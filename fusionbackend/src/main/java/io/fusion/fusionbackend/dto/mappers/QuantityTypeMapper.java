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

import io.fusion.fusionbackend.dto.QuantityTypeDto;
import io.fusion.fusionbackend.model.QuantityType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class QuantityTypeMapper implements EntityDtoMapper<QuantityType, QuantityTypeDto> {
    private final UnitMapper unitMapper;

    @Autowired
    public QuantityTypeMapper(@Lazy UnitMapper unitMapper) {
        this.unitMapper = unitMapper;
    }

    private QuantityTypeDto toDtoShallow(QuantityType entity) {
        if (entity == null) {
            return null;
        }
        return QuantityTypeDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .label(entity.getLabel())
                .unitIds(EntityDtoMapper.getSetOfEntityIds(entity.getUnits()))
                .baseUnitId(EntityDtoMapper.getEntityId(entity.getBaseUnit()))
                .build();
    }

    private QuantityTypeDto toDtoDeep(QuantityType entity) {
        if (entity == null) {
            return null;
        }
        return QuantityTypeDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .label(entity.getLabel())
                .units(unitMapper.toDtoSet(entity.getUnits()))
                .baseUnit(unitMapper.toDto(entity.getBaseUnit(), false))
                .build();
    }

    @Override
    public QuantityTypeDto toDto(QuantityType entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public QuantityType toEntity(QuantityTypeDto dto) {
        if (dto == null) {
            return null;
        }
        return QuantityType.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .label(dto.getLabel())
                .build();
    }

    @Override
    public Set<QuantityTypeDto> toDtoSet(Set<QuantityType> entitySet) {
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<QuantityType> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<QuantityType> toEntitySet(Set<QuantityTypeDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
