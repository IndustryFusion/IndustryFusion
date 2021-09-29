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

import io.fusion.fusionbackend.dto.ThresholdDto;
import io.fusion.fusionbackend.model.Threshold;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ThresholdMapper implements EntityDtoMapper<Threshold, ThresholdDto> {

    @Autowired
    public ThresholdMapper() {
    }

    private ThresholdDto toDtoShallow(final Threshold entity) {
        if (entity == null) {
            return null;
        }

        return ThresholdDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .valueLower(entity.getValueLower())
                .valueUpper(entity.getValueUpper())
                .build();
    }

    private ThresholdDto toDtoDeep(final Threshold entity) {
        return toDtoShallow(entity);
    }

    @Override
    public ThresholdDto toDto(Threshold entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public Threshold toEntity(ThresholdDto dto) {
        if (dto == null) {
            return null;
        }

        return Threshold.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .valueLower(dto.getValueLower())
                .valueUpper(dto.getValueUpper())
                .build();
    }

    @Override
    public Set<ThresholdDto> toDtoSet(Set<Threshold> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<Threshold> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<Threshold> toEntitySet(Set<ThresholdDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
