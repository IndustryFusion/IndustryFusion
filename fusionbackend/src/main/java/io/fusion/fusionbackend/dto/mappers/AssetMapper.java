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

import io.fusion.fusionbackend.dto.AssetDto;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.service.AssetService;
import io.fusion.fusionbackend.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AssetMapper implements EntityDtoMapper<Asset, AssetDto> {
    private final BaseAssetMapper baseAssetMapper;
    private final FieldInstanceMapper fieldInstanceMapper;
    private final RoomService roomService;
    private final RoomMapper roomMapper;
    private final AssetService assetService;


    @Autowired
    public AssetMapper(BaseAssetMapper baseAssetMapper,
                       FieldInstanceMapper fieldInstanceMapper,
                       RoomService roomService,
                       @Lazy RoomMapper roomMapper,
                       AssetService assetService) {
        this.baseAssetMapper = baseAssetMapper;
        this.fieldInstanceMapper = fieldInstanceMapper;
        this.roomService = roomService;
        this.roomMapper = roomMapper;
        this.assetService = assetService;
    }

    private AssetDto toDtoShallow(final Asset entity) {
        if (entity == null) {
            return null;
        }
        // Please mind editing AssetDetailsMapper on changes here too
        AssetDto dto = AssetDto.builder()
                .id(entity.getId())
                .companyId(EntityDtoMapper.getEntityId(entity.getCompany()))
                .assetSeriesId(EntityDtoMapper.getEntityId(entity.getAssetSeries()))
                .fieldInstanceIds(EntityDtoMapper.getSetOfEntityIds(entity.getFieldInstances()))
                .roomId(EntityDtoMapper.getEntityId(entity.getRoom()))
                .externalName(entity.getExternalName())
                .controlSystemType(entity.getControlSystemType())
                .hasGateway(entity.getHasGateway())
                .gatewayConnectivity(entity.getGatewayConnectivity())
                .guid(entity.getGuid())
                .ceCertified(entity.getCeCertified())
                .serialNumber(entity.getSerialNumber())
                .constructionDate(entity.getConstructionDate())
                .protectionClass(entity.getProtectionClass())
                .handbookKey(entity.getHandbookKey())
                .videoKey(entity.getVideoKey())
                .installationDate(entity.getInstallationDate())
                .subsystemIds(toEntityIdSet(entity.getSubsystems()))
                .connectionString(entity.getConnectionString())
                .build();

        baseAssetMapper.copyToDto(entity, dto);

        return dto;
    }

    private AssetDto toDtoDeep(final Asset entity) {
        AssetDto dto = toDtoShallow(entity);
        if (dto == null) {
            return null;
        }

        if (entity.getFieldInstances() != null) {
            dto.setFieldInstances(this.fieldInstanceMapper.toDtoSet(entity.getFieldInstances(), true));
        }
        if (entity.getRoom() != null) {
            dto.setRoom(this.roomMapper.toDto(entity.getRoom(), true));
        }

        baseAssetMapper.copyToDto(entity, dto);

        return dto;
    }

    @Override
    public AssetDto toDto(Asset entity, boolean embedChildren) {
        if (embedChildren) {
            return toDtoDeep(entity);
        }
        return toDtoShallow(entity);
    }

    @Override
    public Asset toEntity(AssetDto dto) {
        if (dto == null) {
            return null;
        }
        Asset entity = Asset.builder()
                .id(dto.getId())
                .externalName(dto.getExternalName())
                .controlSystemType(dto.getControlSystemType())
                .hasGateway(dto.getHasGateway())
                .gatewayConnectivity(dto.getGatewayConnectivity())
                .guid(dto.getGuid())
                .ceCertified(dto.getCeCertified())
                .serialNumber(dto.getSerialNumber())
                .constructionDate(dto.getConstructionDate())
                .protectionClass(dto.getProtectionClass())
                .handbookKey(dto.getHandbookKey())
                .videoKey(dto.getVideoKey())
                .installationDate(dto.getInstallationDate())
                .connectionString(dto.getConnectionString())
                .build();

        addRoomToEntity(dto, entity);
        if (dto.getFieldInstances() != null) {
            entity.setFieldInstances(fieldInstanceMapper.toEntitySet(dto.getFieldInstances()));
        }

        addSubsystemsToEntity(dto, entity);

        baseAssetMapper.copyToEntity(dto, entity);

        return entity;
    }

    private void addSubsystemsToEntity(AssetDto dto, Asset entity) {
        if (dto.getSubsystemIds() != null) {
            dto.getSubsystemIds().forEach(id -> {
                Asset asset = assetService.getAssetById(id);
                entity.getSubsystems().add(asset);
            });
        }
    }

    private void addRoomToEntity(final AssetDto dto, final Asset entity) {
        if (dto.getRoom() != null && dto.getRoomId() != null && !dto.getRoomId().equals(dto.getRoom().getId())) {
            throw new IllegalArgumentException("Id of room is different to roomId");
        }

        if (dto.getRoom() != null) {
            entity.setRoom(roomMapper.toEntity(dto.getRoom()));
        } else if (dto.getRoomId() != null) {
            entity.setRoom(roomService.getRoomById(dto.getRoomId()));
        }
    }

    @Override
    public Set<AssetDto> toDtoSet(Set<Asset> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return entitySet.stream().map(this::toDtoShallow).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<Asset> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }

    @Override
    public Set<Asset> toEntitySet(Set<AssetDto> dtoSet) {
        return dtoSet.stream().map(this::toEntity).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
