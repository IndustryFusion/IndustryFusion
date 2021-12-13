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

import io.fusion.fusionbackend.dto.FieldOptionDto;
import io.fusion.fusionbackend.model.FieldOption;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class FieldOptionMapper implements EntityDtoMapper<FieldOption, FieldOptionDto> {
    @Autowired
    public FieldOptionMapper() {
    }

    private FieldOptionDto toDtoShallow(FieldOption entity) {
        if (entity == null) {
            return null;
        }
        return FieldOptionDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .optionLabel(entity.getLabel())
                .build();
    }

    private FieldOptionDto toDtoDeep(FieldOption entity) {
        return toDtoShallow(entity);
    }

    @Override
    public FieldOptionDto toDto(FieldOption entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public FieldOption toEntity(FieldOptionDto dto) {
        if (dto == null) {
            return null;
        }
        return FieldOption.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .label(dto.getOptionLabel())
                .build();
    }

    @Override
    public LinkedHashSet<FieldOptionDto> toDtoSet(Set<FieldOption> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<FieldOption> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<FieldOption> toEntitySet(Set<FieldOptionDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
