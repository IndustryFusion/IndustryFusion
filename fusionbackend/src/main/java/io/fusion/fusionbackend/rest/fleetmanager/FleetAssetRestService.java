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

package io.fusion.fusionbackend.rest.fleetmanager;

import io.fusion.fusionbackend.dto.AssetDto;
import io.fusion.fusionbackend.dto.mappers.AssetMapper;
import io.fusion.fusionbackend.rest.annotations.IsFleetUser;
import io.fusion.fusionbackend.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@IsFleetUser
public class FleetAssetRestService {
    private final AssetService assetService;
    private final AssetMapper assetMapper;

    @Autowired
    public FleetAssetRestService(AssetService assetService, AssetMapper assetMapper) {
        this.assetService = assetService;
        this.assetMapper = assetMapper;
    }

    @GetMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets/")
    public Set<AssetDto> getAssets(@PathVariable final Long companyId,
                                   @PathVariable final Long assetSeriesId) {
        return assetMapper.toDtoSet(assetService.getAssetsOverAssetSeries(companyId, assetSeriesId));
    }

    @GetMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets/{assetId}")
    public AssetDto getAsset(@PathVariable final Long companyId,
                             @PathVariable final Long assetSeriesId,
                             @PathVariable final Long assetId,
                             @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetMapper.toDto(assetService.getAssetOverAssetSeries(companyId, assetSeriesId, assetId),
                embedChildren);
    }

    @PatchMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets/{assetId}")
    public AssetDto updateAsset(@PathVariable final Long companyId,
                                @PathVariable final Long assetSeriesId,
                                @PathVariable final Long assetId,
                                @RequestBody final AssetDto assetDto) {
        return assetMapper.toDto(assetService.updateAssetSeriesAsset(companyId, assetSeriesId, assetId,
                assetMapper.toEntity(assetDto)),
                false);
    }

    @PostMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets")
    public AssetDto createAssetFromAssetSeries(@PathVariable final Long companyId,
                                               @PathVariable final Long assetSeriesId,
                                               @RequestParam final Long targetCompanyId) {
        return assetMapper.toDto(assetService.createAssetFromAssetSeries(companyId, assetSeriesId, targetCompanyId),
                false);
    }

    @PutMapping(path = "/companies/{companyId}/assets/{assetId}")
    public void moveAssetCompany(@PathVariable final Long companyId,
                                 @PathVariable final Long assetId,
                                 @RequestParam final Long targetCompanyId) {
        assetService.moveAssetCompany(companyId, assetId, targetCompanyId);
    }
}
