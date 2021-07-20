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
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class AssetDetailsMapper extends EntityDetailsDtoMapper<Asset, AssetDetailsDto> {
    protected AssetDetailsDto toDtoDeep(Asset entity) {
        if (entity == null) {
            return null;
        }
        String manufacturer = null;
        String assetSeriesName = null;
        String category = null;
        String roomName = null;
        String factorySiteName = null;
        String assetTypeName = null;

        if (entity.getRoom() != null) {
            Room room = entity.getRoom();
            roomName = room.getName();
            if (room.getFactorySite() != null) {
                factorySiteName = room.getFactorySite().getName();
            }
        }

        if (entity.getAssetSeries() != null) {
            AssetSeries assetSeries = entity.getAssetSeries();
            Company assetSeriesCompany = assetSeries.getCompany();
            manufacturer = assetSeriesCompany.getDescription();
            assetSeriesName = assetSeries.getName();
            if (assetSeries.getAssetTypeTemplate() != null) {
                AssetType assetType = assetSeries.getAssetTypeTemplate().getAssetType();
                category = assetType.getDescription();
                assetTypeName = assetType.getName();
            }
        }

        return AssetDetailsDto.builder()
                .id(entity.getId())
                .companyId(EntityDtoMapper.getEntityId(entity.getCompany()))
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
                .manufacturer(manufacturer)
                .category(category)
                .roomName(roomName)
                .factorySiteName(factorySiteName)
                .assetSeriesName(assetSeriesName)
                .assetTypeName(assetTypeName)
                .name(entity.getName())

                .description(entity.getDescription())
                .imageKey(entity.getImageKey())
                .build();
    }

    @Override
    public Set<Long> toEntityIdSet(Set<Asset> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }
}
