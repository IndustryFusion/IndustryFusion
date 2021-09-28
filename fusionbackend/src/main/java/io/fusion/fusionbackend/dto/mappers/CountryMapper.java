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

import io.fusion.fusionbackend.dto.CountryDto;
import io.fusion.fusionbackend.model.Country;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CountryMapper implements EntityDtoMapper<Country, CountryDto> {
    private CountryDto toDtoShallow(final Country entity) {
        if (entity == null) {
            return null;
        }

        return CountryDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .name(entity.getName())
                .build();
    }

    private CountryDto toDtoDeep(final Country entity) {
        return toDtoShallow(entity);
    }

    @Override
    public CountryDto toDto(Country entity, boolean embedChildren) {
        return toDtoShallow(entity);
    }

    @Override
    public Country toEntity(CountryDto dto) {
        if (dto == null) {
            return null;
        }

        return Country.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .name(dto.getName())
                .build();
    }

    @Override
    public Set<CountryDto> toDtoSet(Set<Country> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<Country> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<Country> toEntitySet(Set<CountryDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
