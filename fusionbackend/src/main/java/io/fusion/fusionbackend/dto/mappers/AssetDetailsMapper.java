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

import io.fusion.fusionbackend.dto.AssetDetailsDto;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.Room;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class AssetDetailsMapper extends EntityDetailsDtoMapper<Asset, AssetDetailsDto> {
    private final BaseAssetMapper baseAssetMapper;

    @Autowired
    public AssetDetailsMapper(BaseAssetMapper baseAssetMapper) {
        this.baseAssetMapper = baseAssetMapper;
    }

    @Override
    protected AssetDetailsDto toDtoDeep(Asset entity) {
        if (entity == null) {
            return null;
        }

        AssetDetailsDto assetDetailsDto = buildFromAsset(entity);
        this.addRoomAndFactorySiteNames(entity, assetDetailsDto);
        this.addDetailAttributesOfAssetSeries(entity, assetDetailsDto);

        return assetDetailsDto;
    }

    private AssetDetailsDto buildFromAsset(Asset entity) {
        AssetDetailsDto dto = AssetDetailsDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
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
                .handbookUrl(entity.getHandbookUrl())
                .videoUrl(entity.getVideoUrl())
                .installationDate(entity.getInstallationDate())
                .subsystemIds(toEntityIdSet(entity.getSubsystems()))
                .connectionString(entity.getConnectionString())
                .protocol(entity.getAssetSeries().getConnectivitySettings().getConnectivityProtocol().getName())
                .build();

        baseAssetMapper.copyToDto(entity, dto);

        return dto;
    }

    private void addRoomAndFactorySiteNames(final Asset entity, final AssetDetailsDto assetDetailsDto) {
        assert entity != null;
        assert assetDetailsDto != null;

        String roomName = null;
        String factorySiteName = null;

        if (entity.getRoom() != null) {
            Room room = entity.getRoom();
            roomName = room.getName();
            if (room.getFactorySite() != null) {
                factorySiteName = room.getFactorySite().getName();
            }
        }

        assetDetailsDto.setRoomName(roomName);
        assetDetailsDto.setFactorySiteName(factorySiteName);
    }

    private void addDetailAttributesOfAssetSeries(final Asset entity, final AssetDetailsDto assetDetailsDto) {
        assert entity != null;
        assert assetDetailsDto != null;

        String manufacturer = null;
        String assetSeriesName = null;
        String category = null;
        String assetTypeName = null;
        Long assetSeriesId = null;

        if (entity.getAssetSeries() != null) {
            AssetSeries assetSeries = entity.getAssetSeries();
            Company assetSeriesCompany = assetSeries.getCompany();
            manufacturer = assetSeriesCompany.getName();
            assetSeriesName = assetSeries.getName();
            assetSeriesId = assetSeries.getId();
            if (assetSeries.getAssetTypeTemplate() != null) {
                AssetType assetType = assetSeries.getAssetTypeTemplate().getAssetType();
                category = assetType.getDescription();
                assetTypeName = assetType.getName();
            }
        }

        assetDetailsDto.setManufacturer(manufacturer);
        assetDetailsDto.setCategory(category);
        assetDetailsDto.setAssetSeriesName(assetSeriesName);
        assetDetailsDto.setAssetSeriesId(assetSeriesId);
        assetDetailsDto.setAssetTypeName(assetTypeName);
        assetDetailsDto.setSubsystemIds(toEntityIdSet(entity.getSubsystems()));
    }

    @Override
    public Set<Long> toEntityIdSet(Set<Asset> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }
}
