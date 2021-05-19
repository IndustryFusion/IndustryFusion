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

import io.fusion.fusionbackend.dto.CompanyDto;
import io.fusion.fusionbackend.model.Company;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CompanyMapper implements EntityDtoMapper<Company, CompanyDto> {
    private final LocationMapper locationMapper;
    private final AssetMapper assetMapper;

    @Autowired
    public CompanyMapper(LocationMapper locationMapper, AssetMapper assetMapper) {
        this.locationMapper = locationMapper;
        this.assetMapper = assetMapper;
    }

    private CompanyDto toDtoShallow(final Company entity) {
        if (entity == null) {
            return null;
        }
        return CompanyDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .locationIds(EntityDtoMapper.getSetOfEntityIds(entity.getLocations()))
                .assetIds(EntityDtoMapper.getSetOfEntityIds(entity.getAssets()))
                .name(entity.getName())
                .description(entity.getDescription())
                .imageKey(entity.getImageKey())
                .build();
    }

    private CompanyDto toDtoDeep(final Company entity) {
        if (entity == null) {
            return null;
        }
        return CompanyDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .locations(locationMapper.toDtoSet(entity.getLocations(), false))
                .assets(assetMapper.toDtoSet(entity.getAssets(), false))
                .name(entity.getName())
                .description(entity.getDescription())
                .imageKey(entity.getImageKey())
                .build();
    }

    @Override
    public CompanyDto toDto(Company entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public Company toEntity(CompanyDto dto) {
        if (dto == null) {
            return null;
        }
        return Company.builder()
                .id(dto.getId())
                .type(dto.getType())
                .name(dto.getName())
                .description(dto.getDescription())
                .imageKey(dto.getImageKey())
                .build();
    }

    @Override
    public Set<CompanyDto> toDtoSet(Set<Company> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<Company> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<Company> toEntitySet(Set<CompanyDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
