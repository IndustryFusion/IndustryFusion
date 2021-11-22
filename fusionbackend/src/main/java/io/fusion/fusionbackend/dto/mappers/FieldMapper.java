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

import io.fusion.fusionbackend.dto.BaseEntityDto;
import io.fusion.fusionbackend.dto.FieldDto;
import io.fusion.fusionbackend.dto.FieldOptionDto;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldOption;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class FieldMapper implements EntityDtoMapper<Field, FieldDto> {
    private final UnitMapper unitMapper;
    private final FieldOptionMapper fieldOptionMapper;

    @Autowired
    public FieldMapper(UnitMapper unitMapper, FieldOptionMapper fieldOptionMapper) {
        this.unitMapper = unitMapper;
        this.fieldOptionMapper = fieldOptionMapper;
    }

    private FieldDto toDtoShallow(Field entity) {
        if (entity == null) {
            return null;
        }
        return FieldDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .name(entity.getName())
                .description(entity.getDescription())
                .label(entity.getLabel())
                .dataType(entity.getDataType())
                .accuracy(entity.getAccuracy())
                .unitId(EntityDtoMapper.getEntityId(entity.getUnit()))
                .thresholdType(entity.getThresholdType())
                .widgetType(entity.getWidgetType())
                .creationDate(entity.getCreationDate())
                .build();
    }

    private FieldDto toDtoDeep(Field entity) {
        if (entity == null) {
            return null;
        }

        FieldDto fieldDto = toDtoShallow(entity);
        fieldDto.setUnit(unitMapper.toDto(entity.getUnit(), false));

        Set<FieldOptionDto> fieldOptions = fieldOptionMapper.toDtoSet(entity.getOptions(), true);
        fieldDto.setEnumOptions(fieldOptions);

        return fieldDto;
    }

    @Override
    public FieldDto toDto(Field entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public Field toEntity(FieldDto dto) {
        if (dto == null) {
            return null;
        }
        Set<FieldOption> fieldOptions = new LinkedHashSet<>();
        if (dto.getEnumOptions() != null) {
            fieldOptions = dto.getEnumOptions().stream().map(fieldOptionMapper::toEntity).collect(Collectors.toSet());
        }

        return Field.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .label(dto.getLabel())
                .dataType(dto.getDataType())
                .accuracy(dto.getAccuracy())
                .thresholdType(dto.getThresholdType())
                .widgetType(dto.getWidgetType())
                .options(fieldOptions)
                .build();
    }

    @Override
    public Set<FieldDto> toDtoSet(Set<Field> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).sorted(Comparator.comparing(BaseEntityDto::getId))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<Field> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<Field> toEntitySet(Set<FieldDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
