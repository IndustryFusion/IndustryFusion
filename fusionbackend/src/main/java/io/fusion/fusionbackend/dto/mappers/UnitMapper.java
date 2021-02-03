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

import io.fusion.fusionbackend.dto.UnitDto;
import io.fusion.fusionbackend.model.Unit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UnitMapper implements EntityDtoMapper<Unit, UnitDto> {
    private final QuantityTypeMapper quantityTypeMapper;

    @Autowired
    public UnitMapper(@Lazy QuantityTypeMapper quantityTypeMapper) {
        this.quantityTypeMapper = quantityTypeMapper;
    }

    private UnitDto toDtoShallow(Unit entity) {
        if (entity == null) {
            return null;
        }
        return UnitDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .label(entity.getLabel())
                .description(entity.getDescription())
                .symbol(entity.getSymbol())
                .quantityTypeId(EntityDtoMapper.getEntityId(entity.getQuantityType()))
                .build();
    }

    private UnitDto toDtoDeep(Unit entity) {
        if (entity == null) {
            return null;
        }
        return UnitDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .label(entity.getLabel())
                .quantityType(quantityTypeMapper.toDto(entity.getQuantityType(), false))
                .build();
    }

    @Override
    public UnitDto toDto(Unit entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public Unit toEntity(UnitDto dto) {
        if (dto == null) {
            return null;
        }
        return Unit.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .label(dto.getLabel())
                .symbol(dto.getSymbol())
                .build();
    }

    @Override
    public Set<UnitDto> toDtoSet(Set<Unit> entitySet) {
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<Unit> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<Unit> toEntitySet(Set<UnitDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
