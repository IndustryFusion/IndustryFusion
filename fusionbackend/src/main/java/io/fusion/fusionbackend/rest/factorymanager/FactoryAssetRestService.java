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

package io.fusion.fusionbackend.rest.factorymanager;

import io.fusion.fusionbackend.dto.AssetDetailsDto;
import io.fusion.fusionbackend.dto.AssetDto;
import io.fusion.fusionbackend.dto.mappers.AssetDetailsMapper;
import io.fusion.fusionbackend.dto.mappers.AssetMapper;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.rest.annotations.IsFactoryUser;
import io.fusion.fusionbackend.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Set;

@RestController
@IsFactoryUser
public class FactoryAssetRestService {
    private final AssetService assetService;
    private final AssetMapper assetMapper;
    private final AssetDetailsMapper assetDetailsMapper;

    @Autowired
    public FactoryAssetRestService(AssetService assetService,
                                   AssetMapper assetMapper,
                                   AssetDetailsMapper assetDetailsMapper) {
        this.assetService = assetService;
        this.assetMapper = assetMapper;
        this.assetDetailsMapper = assetDetailsMapper;
    }

    @GetMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}/assets")
    public Set<AssetDto> getAssetsOfFactorySite(@PathVariable final Long companyId,
                                                @PathVariable final Long factorySiteId,
                                                @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetMapper.toDtoSet(assetService.getAssetsByFactorySite(companyId, factorySiteId), embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/factoryassetdetails")
    public Set<AssetDetailsDto> getAssetDetails(@PathVariable final Long companyId,
                                                @RequestParam(defaultValue = "true") final boolean embedChildren) {
        Set<Asset> assetSet = assetService.getAssetsByCompany(companyId);
        return assetDetailsMapper.toDtoSet(assetSet, embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/factoryassetdetails/{assetDetailsId}")
    public AssetDetailsDto getSingleAssetDetails(@PathVariable final Long companyId,
                                                 @PathVariable final Long assetDetailsId,
                                                 @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetDetailsMapper.toDto(assetService.getAssetById(assetDetailsId), embedChildren);
    }

    // Rooms path
    @GetMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}/rooms/{roomId}/assets")
    public Set<AssetDto> getAssets(@PathVariable final Long companyId,
                                   @PathVariable final Long factorySiteId,
                                   @PathVariable final Long roomId,
                                   @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetMapper.toDtoSet(assetService.getAssetsCheckFullPath(companyId, factorySiteId, roomId),
                embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}/rooms/{roomId}/assets/{assetId}")
    public AssetDto getAsset(@PathVariable final Long companyId,
                             @PathVariable final Long factorySiteId,
                             @PathVariable final Long roomId,
                             @PathVariable final Long assetId,
                             @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetMapper.toDto(assetService.getAssetCheckFullPath(companyId, factorySiteId, roomId, assetId),
                embedChildren);
    }

    @PatchMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}/rooms/{roomId}/assets/{assetId}")
    public AssetDto updateAsset(@PathVariable final Long companyId,
                                @PathVariable final Long factorySiteId,
                                @PathVariable final Long roomId,
                                @PathVariable final Long assetId,
                                @RequestBody final AssetDto assetDto) {
        // TODO Open: what the factory manager can change on an asset
        return assetMapper.toDto(assetService.updateRoomAsset(companyId, factorySiteId, roomId, assetId,
                assetMapper.toEntity(assetDto)), false);
    }

    @DeleteMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}/rooms/{roomId}/assets/{assetId}")
    public AssetDto removeAssetFromRoom(@PathVariable final Long companyId,
                                        @PathVariable final Long factorySiteId,
                                        @PathVariable final Long roomId,
                                        @PathVariable final Long assetId) {
        return assetMapper.toDto(assetService.removeAssetFromRoom(companyId, factorySiteId, roomId, assetId), false);
    }

    @DeleteMapping(path = "/companies/{companyId}/assets/{assetId}")
    public void deleteAsset(@PathVariable final Long companyId,
                                        @PathVariable final Long assetId) {
        assetService.deleteAsset(companyId, assetId);
    }


    @PutMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}/rooms/{roomId}/assets/{assetId}")
    public AssetDto assignAssetToRoom(@PathVariable final Long companyId,
                                      @PathVariable final Long factorySiteId,
                                      @PathVariable final Long roomId,
                                      @PathVariable final Long assetId) {
        return assetMapper.toDto(assetService.moveAssetToRoom(companyId, factorySiteId, roomId, assetId), false);
    }

    @PutMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}/rooms/{roomId}/assets/"
            + "assigningAssetsToRoom")
    public Set<AssetDto> assignAssetsToRoom(@PathVariable final Long companyId,
                                       @PathVariable final Long factorySiteId,
                                       @PathVariable final Long roomId,
                                       @RequestBody final Asset[] assets) {
        return assetMapper.toDtoSet(assetService.moveAssetsToRoom(companyId, factorySiteId, roomId, assets), false);
    }

    // Company direct path
    // TODO: Rename ...Company... to ...Factory...?
    @GetMapping(path = "/companies/{companyId}/assets")
    public Set<AssetDto> getCompanyAssets(@PathVariable final Long companyId,
                                          @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetMapper.toDtoSet(assetService.getAssetsByCompany(companyId), embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/assets/{assetId}")
    public AssetDto getCompanyAsset(@PathVariable final Long companyId,
                                    @PathVariable final Long assetId,
                                    @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetMapper.toDto(assetService.getAssetByCompany(companyId, assetId), embedChildren);
    }

    @PutMapping(path = "/companies/{companyId}/assets/{assetId}")
    public AssetDto updateCompanyAsset(@PathVariable final Long companyId,
                                       @PathVariable final Long assetId,
                                       @RequestBody final AssetDto assetDto) {
        // TODO Open: what the factory manager can change on an asset
        return assetMapper.toDto(assetService.updateAsset(assetMapper.toEntity(assetDto)), false);
    }
}
