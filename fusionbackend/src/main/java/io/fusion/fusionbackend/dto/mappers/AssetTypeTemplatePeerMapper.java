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

import io.fusion.fusionbackend.dto.AssetTypeTemplatePeerDto;
import io.fusion.fusionbackend.model.AssetTypeTemplatePeer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AssetTypeTemplatePeerMapper implements EntityDtoMapper<AssetTypeTemplatePeer, AssetTypeTemplatePeerDto> {
    private final AssetTypeTemplateMapper assetTypeTemplateMapper;

    @Autowired
    public AssetTypeTemplatePeerMapper(@Lazy AssetTypeTemplateMapper assetTypeTemplateMapper) {
        this.assetTypeTemplateMapper = assetTypeTemplateMapper;
    }

    private AssetTypeTemplatePeerDto toDtoShallow(final AssetTypeTemplatePeer entity) {
        if (entity == null) {
            return null;
        }

        return AssetTypeTemplatePeerDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .peerId(EntityDtoMapper.getEntityId(entity.getPeer()))
                .customName(entity.getCustomName())
                .cardinality(entity.getCardinality())
                .mandatory(entity.getMandatory())
                .build();
    }

    private AssetTypeTemplatePeerDto toDtoDeep(final AssetTypeTemplatePeer entity) {
        final AssetTypeTemplatePeerDto dto = toDtoShallow(entity);

        dto.setPeer(assetTypeTemplateMapper.toDto(entity.getPeer(), false));

        return dto;
    }

    @Override
    public AssetTypeTemplatePeerDto toDto(AssetTypeTemplatePeer entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public AssetTypeTemplatePeer toEntity(AssetTypeTemplatePeerDto dto) {
        if (dto == null) {
            return null;
        }
        AssetTypeTemplatePeer entity = AssetTypeTemplatePeer.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .customName(dto.getCustomName())
                .cardinality(dto.getCardinality())
                .mandatory(dto.getMandatory())
                .build();

        if (dto.getPeer() != null) {
            entity.setPeer(assetTypeTemplateMapper.toEntity(dto.getPeer()));
        }

        return entity;
    }

    @Override
    public Set<AssetTypeTemplatePeerDto> toDtoSet(Set<AssetTypeTemplatePeer> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<AssetTypeTemplatePeer> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<AssetTypeTemplatePeer> toEntitySet(Set<AssetTypeTemplatePeerDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
