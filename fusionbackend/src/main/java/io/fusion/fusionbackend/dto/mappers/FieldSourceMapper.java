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

import io.fusion.fusionbackend.dto.FieldSourceDto;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.model.Unit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class FieldSourceMapper implements EntityDtoMapper<FieldSource, FieldSourceDto> {
    private final FieldTargetMapper fieldTargetMapper;
    private final UnitMapper unitMapper;
    private final ThresholdMapper thresholdMapper;

    @Autowired
    public FieldSourceMapper(FieldTargetMapper fieldTargetMapper,
                             UnitMapper unitMapper,
                             ThresholdMapper thresholdMapper) {
        this.fieldTargetMapper = fieldTargetMapper;
        this.unitMapper = unitMapper;
        this.thresholdMapper = thresholdMapper;
    }

    private FieldSourceDto toDtoShallow(FieldSource entity) {
        if (entity == null) {
            return null;
        }
        return FieldSourceDto.builder()
                .id(entity.getId())
                .assetSeriesId(EntityDtoMapper.getEntityId(entity.getAssetSeries()))
                .fieldTargetId(EntityDtoMapper.getEntityId(entity.getFieldTarget()))
                .sourceUnitId(EntityDtoMapper.getEntityId(entity.getSourceUnit()))
                .sourceSensorLabel(entity.getSourceSensorLabel())
                .name(entity.getName())
                .description(entity.getDescription())
                .value(entity.getValue())
                .register(entity.getRegister())
                .absoluteThresholdId(EntityDtoMapper.getEntityId(entity.getAbsoluteThreshold()))
                .idealThresholdId(EntityDtoMapper.getEntityId(entity.getIdealThreshold()))
                .criticalThresholdId(EntityDtoMapper.getEntityId(entity.getCriticalThreshold()))
                .build();
    }

    private FieldSourceDto toDtoDeep(FieldSource entity) {
        if (entity == null) {
            return null;
        }
        return FieldSourceDto.builder()
                .id(entity.getId())
                .assetSeriesId(EntityDtoMapper.getEntityId(entity.getAssetSeries()))
                .fieldTarget(fieldTargetMapper.toDto(entity.getFieldTarget(), false))
                .sourceUnit(unitMapper.toDto(entity.getSourceUnit(), false))
                .sourceSensorLabel(entity.getSourceSensorLabel())
                .name(entity.getName())
                .description(entity.getDescription())
                .value(entity.getValue())
                .register(entity.getRegister())
                .absoluteThreshold(thresholdMapper.toDto(entity.getAbsoluteThreshold(), false))
                .idealThreshold(thresholdMapper.toDto(entity.getIdealThreshold(), false))
                .criticalThreshold(thresholdMapper.toDto(entity.getCriticalThreshold(), false))
                .build();
    }

    @Override
    public FieldSourceDto toDto(FieldSource entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public FieldSource toEntity(FieldSourceDto dto) {
        if (dto == null) {
            return null;
        }
        FieldSource fieldSource = FieldSource.builder()
                .id(dto.getId())
                .sourceSensorLabel(dto.getSourceSensorLabel())
                .name(dto.getName())
                .description(dto.getDescription())
                .value(dto.getValue())
                .register(dto.getRegister())
                .build();

        FieldTarget fieldTarget = fieldTargetMapper.toEntity(dto.getFieldTarget());
        fieldSource.setFieldTarget(fieldTarget);

        Unit unit = unitMapper.toEntity(dto.getSourceUnit());
        fieldSource.setSourceUnit(unit);

        return fieldSource;
    }

    @Override
    public Set<FieldSourceDto> toDtoSet(Set<FieldSource> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<FieldSource> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<FieldSource> toEntitySet(Set<FieldSourceDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
