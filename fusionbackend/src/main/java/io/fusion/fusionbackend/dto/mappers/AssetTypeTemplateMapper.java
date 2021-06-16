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

import io.fusion.fusionbackend.dto.AssetTypeTemplateDto;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AssetTypeTemplateMapper implements EntityDtoMapper<AssetTypeTemplate, AssetTypeTemplateDto> {
    private final BaseAssetMapper baseAssetMapper;
    private final FieldTargetMapper fieldTargetMapper;
    private final AssetTypeMapper assetTypeMapper;

    @Autowired
    public AssetTypeTemplateMapper(BaseAssetMapper baseAssetMapper,
                                   FieldTargetMapper fieldTargetMapper,
                                   AssetTypeMapper assetTypeMapper) {
        this.baseAssetMapper = baseAssetMapper;
        this.fieldTargetMapper = fieldTargetMapper;
        this.assetTypeMapper = assetTypeMapper;
    }

    private AssetTypeTemplateDto toDtoShallow(final AssetTypeTemplate entity) {
        if (entity == null) {
            return null;
        }
        final AssetTypeTemplateDto dto = AssetTypeTemplateDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .assetTypeId(EntityDtoMapper.getEntityId(entity.getAssetType()))
                .published(entity.getPublished())
                .publishedDate(entity.getPublishedDate())
                .publishedVersion(entity.getPublishedVersion())
                .build();
        dto.setFieldTargetIds(fieldTargetMapper.toEntityIdSet(entity.getFieldTargets()));

        baseAssetMapper.copyToDto(entity, dto);

        return dto;
    }

    private AssetTypeTemplateDto toDtoDeep(final AssetTypeTemplate entity) {
        if (entity == null) {
            return null;
        }
        final AssetTypeTemplateDto dto = AssetTypeTemplateDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .assetTypeId(EntityDtoMapper.getEntityId(entity.getAssetType()))
                .published(entity.getPublished())
                .publishedDate(entity.getPublishedDate())
                .publishedVersion(entity.getPublishedVersion())
                .build();
        dto.setFieldTargets(fieldTargetMapper.toDtoSet(entity.getFieldTargets(), false));
        dto.setAssetType(assetTypeMapper.toDto(entity.getAssetType(), false));

        baseAssetMapper.copyToDto(entity, dto);

        return dto;
    }

    @Override
    public AssetTypeTemplateDto toDto(AssetTypeTemplate entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public AssetTypeTemplate toEntity(AssetTypeTemplateDto dto) {
        if (dto == null) {
            return null;
        }
        AssetTypeTemplate entity = AssetTypeTemplate.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .published(dto.getPublished())
                .publishedDate(dto.getPublishedDate())
                .publishedVersion(dto.getPublishedVersion())
                .build();

        baseAssetMapper.copyToEntity(dto, entity);

        return entity;
    }

    @Override
    public Set<AssetTypeTemplateDto> toDtoSet(Set<AssetTypeTemplate> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<AssetTypeTemplate> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<AssetTypeTemplate> toEntitySet(Set<AssetTypeTemplateDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
