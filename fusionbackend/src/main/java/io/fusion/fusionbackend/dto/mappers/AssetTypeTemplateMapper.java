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
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
import io.fusion.fusionbackend.model.FieldTarget;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AssetTypeTemplateMapper implements EntityDtoMapper<AssetTypeTemplate, AssetTypeTemplateDto> {
    private final BaseAssetMapper baseAssetMapper;
    private final FieldTargetMapper fieldTargetMapper;
    private final AssetTypeMapper assetTypeMapper;
    private final AssetTypeTemplateService assetTypeTemplateService;

    @Autowired
    public AssetTypeTemplateMapper(BaseAssetMapper baseAssetMapper,
                                   FieldTargetMapper fieldTargetMapper,
                                   AssetTypeMapper assetTypeMapper,
                                   @Lazy
                                   AssetTypeTemplateService assetTypeTemplateService) {
        this.baseAssetMapper = baseAssetMapper;
        this.fieldTargetMapper = fieldTargetMapper;
        this.assetTypeMapper = assetTypeMapper;
        this.assetTypeTemplateService = assetTypeTemplateService;
    }

    private AssetTypeTemplateDto toDtoShallow(final AssetTypeTemplate entity) {
        if (entity == null) {
            return null;
        }
        final AssetTypeTemplateDto dto = AssetTypeTemplateDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .assetTypeId(EntityDtoMapper.getEntityId(entity.getAssetType()))
                .publicationState(entity.getPublicationState())
                .publishedDate(entity.getPublishedDate())
                .publishedVersion(entity.getPublishedVersion())
                .creationDate(entity.getCreationDate())
                .fieldTargetIds(fieldTargetMapper.toEntityIdSet(entity.getFieldTargets()))
                .subsystemIds(toEntityIdSet(entity.getSubsystems()))
                .build();

        baseAssetMapper.copyToDto(entity, dto);

        return dto;
    }

    private AssetTypeTemplateDto toDtoDeep(final AssetTypeTemplate entity) {
        final AssetTypeTemplateDto dto = toDtoShallow(entity);

        dto.setFieldTargets(fieldTargetMapper.toDtoSet(entity.getFieldTargets(), false));
        dto.setAssetType(assetTypeMapper.toDto(entity.getAssetType(), false));

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
                .publicationState(dto.getPublicationState())
                .publishedDate(dto.getPublishedDate())
                .publishedVersion(dto.getPublishedVersion())
                .build();

        baseAssetMapper.copyToEntity(dto, entity);

        if (dto.getFieldTargets() != null) {
            Set<FieldTarget> fieldTargets = fieldTargetMapper.toEntitySet(dto.getFieldTargets());
            entity.setFieldTargets(fieldTargets);
        }

        addSubsystemsToEntity(dto, entity);

        return entity;
    }

    private void addSubsystemsToEntity(AssetTypeTemplateDto dto, AssetTypeTemplate entity) {
        if (dto.getSubsystemIds() != null) {
            dto.getSubsystemIds().forEach(id -> {
                AssetTypeTemplate assetTypeTemplate = assetTypeTemplateService.getAssetTypeTemplate(id, false);
                entity.getSubsystems().add(assetTypeTemplate);
            });
        }
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
