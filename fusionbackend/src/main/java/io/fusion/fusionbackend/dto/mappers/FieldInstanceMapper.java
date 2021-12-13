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

import io.fusion.fusionbackend.dto.FieldInstanceDto;
import io.fusion.fusionbackend.model.FieldInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class FieldInstanceMapper implements EntityDtoMapper<FieldInstance, FieldInstanceDto> {
    private final FieldSourceMapper fieldSourceMapper;
    private final ThresholdMapper thresholdMapper;

    @Autowired
    public FieldInstanceMapper(FieldSourceMapper fieldSourceMapper,
                               ThresholdMapper thresholdMapper) {
        this.fieldSourceMapper = fieldSourceMapper;
        this.thresholdMapper = thresholdMapper;
    }

    private FieldInstanceDto toDtoShallow(FieldInstance entity) {
        if (entity == null) {
            return null;
        }
        return FieldInstanceDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .globalId(entity.getGlobalId())
                .assetId(EntityDtoMapper.getEntityId(entity.getAsset()))
                .fieldSourceId(EntityDtoMapper.getEntityId(entity.getFieldSource()))
                .fieldSourceGlobalId(entity.getFieldSource().getGlobalId())
                .name(entity.getName())
                .description(entity.getDescription())
                .externalName(entity.getExternalName())
                .value(entity.getValue())
                .absoluteThresholdId(EntityDtoMapper.getEntityId(entity.getAbsoluteThreshold()))
                .idealThresholdId(EntityDtoMapper.getEntityId(entity.getIdealThreshold()))
                .criticalThresholdId(EntityDtoMapper.getEntityId(entity.getCriticalThreshold()))
                .build();
    }

    private FieldInstanceDto toDtoDeep(FieldInstance entity) {
        if (entity == null) {
            return null;
        }

        FieldInstanceDto fieldInstanceDto = toDtoShallow(entity);

        fieldInstanceDto.setFieldSource(fieldSourceMapper.toDto(entity.getFieldSource(), true));
        fieldInstanceDto.setAbsoluteThreshold(thresholdMapper.toDto(entity.getAbsoluteThreshold(), false));
        fieldInstanceDto.setIdealThreshold(thresholdMapper.toDto(entity.getIdealThreshold(), false));
        fieldInstanceDto.setCriticalThreshold(thresholdMapper.toDto(entity.getCriticalThreshold(), false));

        return fieldInstanceDto;
    }

    @Override
    public FieldInstanceDto toDto(FieldInstance entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public FieldInstance toEntity(FieldInstanceDto dto) {
        if (dto == null) {
            return null;
        }
        FieldInstance entity = FieldInstance.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .name(dto.getName())
                .globalId(dto.getGlobalId())
                .description(dto.getDescription())
                .externalName(dto.getExternalName())
                .value(dto.getValue())
                .build();

        if (dto.getFieldSource() != null) {
            entity.setFieldSource(fieldSourceMapper.toEntity(dto.getFieldSource()));
        }
        if (dto.getAbsoluteThreshold() != null) {
            entity.setAbsoluteThreshold(thresholdMapper.toEntity(dto.getAbsoluteThreshold()));
        }
        if (dto.getIdealThreshold() != null) {
            entity.setIdealThreshold(thresholdMapper.toEntity(dto.getIdealThreshold()));
        }
        if (dto.getCriticalThreshold() != null) {
            entity.setCriticalThreshold(thresholdMapper.toEntity(dto.getCriticalThreshold()));
        }

        return entity;
    }

    @Override
    public Set<FieldInstanceDto> toDtoSet(Set<FieldInstance> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<FieldInstance> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<FieldInstance> toEntitySet(Set<FieldInstanceDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
