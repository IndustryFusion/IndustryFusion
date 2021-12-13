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

import io.fusion.fusionbackend.dto.AssetSeriesDto;
import io.fusion.fusionbackend.dto.FieldSourceDto;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.FieldSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AssetSeriesMapper implements EntityDtoMapper<AssetSeries, AssetSeriesDto> {
    private final BaseAssetMapper baseAssetMapper;
    private final FieldSourceMapper fieldSourceMapper;
    private final ConnectivitySettingsMapper connectivitySettingsMapper;

    @Autowired
    public AssetSeriesMapper(BaseAssetMapper baseAssetMapper,
                             FieldSourceMapper fieldSourceMapper,
                             ConnectivitySettingsMapper connectivitySettingsMapper) {
        this.baseAssetMapper = baseAssetMapper;
        this.fieldSourceMapper = fieldSourceMapper;
        this.connectivitySettingsMapper = connectivitySettingsMapper;
    }


    private AssetSeriesDto toDtoShallow(final AssetSeries entity) {
        if (entity == null) {
            return null;
        }
        final AssetSeriesDto dto = AssetSeriesDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .globalId(entity.getGlobalId())
                .companyId(EntityDtoMapper.getEntityId(entity.getCompany()))
                .assetTypeTemplateId(EntityDtoMapper.getEntityId(entity.getAssetTypeTemplate()))
                .ceCertified(entity.getCeCertified())
                .protectionClass(entity.getProtectionClass())
                .handbookUrl(entity.getHandbookUrl())
                .videoUrl(entity.getVideoUrl())
                .fieldSourceIds(EntityDtoMapper.getSetOfEntityIds(entity.getFieldSources()))
                .connectivitySettingsId(entity.getConnectivitySettings().getId())
                .customScript(entity.getCustomScript())
                .build();

        baseAssetMapper.copyToDto(entity, dto);

        return dto;
    }


    private AssetSeriesDto toDtoDeep(final AssetSeries entity) {
        AssetSeriesDto assetSeriesDto = toDtoShallow(entity);
        if (assetSeriesDto.getFieldSources() != null) {
            Set<FieldSourceDto> fieldSourceDtos = fieldSourceMapper.toDtoSet(entity.getFieldSources(), true);
            assetSeriesDto.setFieldSources(fieldSourceDtos);
        }

        if (entity.getConnectivitySettings() != null) {
            assetSeriesDto.setConnectivitySettings(
                    connectivitySettingsMapper.toDto(entity.getConnectivitySettings(), false));
        }

        return assetSeriesDto;
    }

    @Override
    public AssetSeriesDto toDto(AssetSeries entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        } else {
            return toDtoShallow(entity);
        }
    }

    @Override
    public AssetSeries toEntity(AssetSeriesDto dto) {
        if (dto == null) {
            return null;
        }
        final AssetSeries entity = AssetSeries.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .globalId(dto.getGlobalId())
                .ceCertified(dto.getCeCertified())
                .protectionClass(dto.getProtectionClass())
                .handbookUrl(dto.getHandbookUrl())
                .videoUrl(dto.getVideoUrl())
                .customScript(dto.getCustomScript())
                .build();

        baseAssetMapper.copyToEntity(dto, entity);

        if (dto.getFieldSources() != null) {
            Set<FieldSource> fieldSources = fieldSourceMapper.toEntitySet(dto.getFieldSources());
            entity.setFieldSources(fieldSources);
        }

        if (dto.getConnectivitySettings() != null) {
            entity.setConnectivitySettings(connectivitySettingsMapper.toEntity(dto.getConnectivitySettings()));
        }

        return entity;
    }

    @Override
    public Set<AssetSeriesDto> toDtoSet(Set<AssetSeries> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<AssetSeries> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<AssetSeries> toEntitySet(Set<AssetSeriesDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
