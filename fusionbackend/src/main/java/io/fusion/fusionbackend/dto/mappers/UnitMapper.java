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
import io.fusion.fusionbackend.service.QuantityTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UnitMapper implements EntityDtoMapper<Unit, UnitDto> {
    private final QuantityTypeMapper quantityTypeMapper;
    private final QuantityTypeService quantityTypeService;

    @Autowired
    public UnitMapper(@Lazy QuantityTypeMapper quantityTypeMapper, QuantityTypeService quantityTypeService) {
        this.quantityTypeMapper = quantityTypeMapper;
        this.quantityTypeService = quantityTypeService;
    }

    private UnitDto toDtoShallow(Unit entity) {
        if (entity == null) {
            return null;
        }
        return UnitDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .name(entity.getName())
                .label(entity.getLabel())
                .symbol(entity.getSymbol())
                .createdDate(entity.getCreatedDate())
                .quantityTypeId(EntityDtoMapper.getEntityId(entity.getQuantityType()))
                .build();
    }

    private UnitDto toDtoDeep(Unit entity) {
        if (entity == null) {
            return null;
        }

        UnitDto unitDto = toDtoShallow(entity);

        unitDto.setQuantityType(quantityTypeMapper.toDto(entity.getQuantityType(), false));

        return unitDto;
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
        Unit unit = Unit.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .name(dto.getName())
                .label(dto.getLabel())
                .symbol(dto.getSymbol())
                .build();

        if (dto.getQuantityType() != null) {
            unit.setQuantityType(quantityTypeService.getQuantityType(dto.getQuantityType().getId()));
        }
        return unit;
    }

    @Override
    public Set<UnitDto> toDtoSet(Set<Unit> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
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
