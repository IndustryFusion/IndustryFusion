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
import io.fusion.fusionbackend.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AssetMapper implements EntityDtoMapper<Asset, AssetDto> {
    private final BaseAssetMapper baseAssetMapper;
    private final RoomService roomService;

    @Autowired
    public AssetMapper(BaseAssetMapper baseAssetMapper,
                       RoomService roomService) {
        this.baseAssetMapper = baseAssetMapper;
        this.roomService = roomService;
    }

    private AssetDto toDtoShallow(final Asset entity) {
        if (entity == null) {
            return null;
        }
        AssetDto dto = AssetDto.builder()
                .id(entity.getId())
                .companyId(EntityDtoMapper.getEntityId(entity.getCompany()))
                .assetSeriesId(EntityDtoMapper.getEntityId(entity.getAssetSeries()))
                .roomId(EntityDtoMapper.getEntityId(entity.getRoom()))
                .externalId(entity.getExternalId())
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
                .build();

        if (entity.getRoom() != null) {
            dto.setRoomId(entity.getRoom().getId());
        }

        baseAssetMapper.copyToDto(entity, dto);

        return dto;
    }

    private AssetDto toDtoDeep(final Asset entity) {
        return toDtoShallow(entity);
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
                .externalId(dto.getExternalId())
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
                .build();

        if (dto.getRoomId() != null) {
            entity.setRoom(roomService.getRoomById(dto.getRoomId()));
        }

        baseAssetMapper.copyToEntity(dto, entity);

        return entity;
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
