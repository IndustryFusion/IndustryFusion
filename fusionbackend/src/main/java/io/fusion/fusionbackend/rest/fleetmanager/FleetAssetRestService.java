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
import io.fusion.fusionbackend.dto.FieldInstanceDto;
import io.fusion.fusionbackend.dto.mappers.AssetMapper;
import io.fusion.fusionbackend.dto.mappers.FieldInstanceMapper;
import io.fusion.fusionbackend.rest.annotations.IsFleetUser;
import io.fusion.fusionbackend.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@IsFleetUser
public class FleetAssetRestService {
    private final AssetService assetService;
    private final AssetMapper assetMapper;
    private final FieldInstanceMapper fieldInstanceMapper;

    @Autowired
    public FleetAssetRestService(AssetService assetService,
                                 AssetMapper assetMapper,
                                 FieldInstanceMapper fieldInstanceMapper) {
        this.assetService = assetService;
        this.assetMapper = assetMapper;
        this.fieldInstanceMapper = fieldInstanceMapper;
    }

    @GetMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets/")
    public Set<AssetDto> getAssets(@PathVariable final Long companyId,
                                   @PathVariable final Long assetSeriesId,
                                   @RequestParam(defaultValue = "true") final boolean embedChildren) {
        return assetMapper.toDtoSet(assetService.getAssetsOverAssetSeries(companyId, assetSeriesId), embedChildren);
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

    @PatchMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets/{assetId}/company-transfer")
    public AssetDto transferFleetAssetToFactory(@PathVariable final Long companyId,
                                @PathVariable final Long assetSeriesId,
                                @PathVariable final Long assetId,
                                @RequestBody final Long targetCompanyId,
                                @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetMapper.toDto(assetService.transferFromFleetToFactory(companyId, targetCompanyId,
                assetSeriesId, assetId),
                embedChildren);
    }

    @PostMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets")
    public AssetDto createAsset(@PathVariable final Long companyId,
                                @PathVariable final Long assetSeriesId,
                                @RequestBody final AssetDto assetDto) {
        return assetMapper.toDto(
                assetService.createAssetAggregate(companyId, assetSeriesId, assetMapper.toEntity(assetDto)),
                true);
    }

    @GetMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}/rooms/{roomId}/assets/{assetId}/"
            + "fieldinstances")
    public Set<FieldInstanceDto> getFieldInstancesCheckFullPath(@PathVariable final Long companyId,
                                                                @PathVariable final Long factorySiteId,
                                                                @PathVariable final Long roomId,
                                                                @PathVariable final Long assetId,
                                                                @RequestParam(defaultValue = "false")
                                                                final boolean embedChildren) {
        return fieldInstanceMapper.toDtoSet(
                assetService.getFieldInstancesCheckFullPath(companyId, factorySiteId, roomId, assetId), embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/assets/{assetId}/fieldinstances")
    public Set<FieldInstanceDto> getFieldInstances(@PathVariable final Long companyId,
                                                   @PathVariable final Long assetId,
                                                   @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return fieldInstanceMapper.toDtoSet(assetService.getFieldInstances(companyId, assetId), embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/assets/{assetId}/fieldinstances/{fieldInstanceId}")
    public FieldInstanceDto getFieldInstance(@PathVariable final Long companyId,
                                             @PathVariable final Long assetId,
                                             @PathVariable final Long fieldInstanceId,
                                             @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return fieldInstanceMapper.toDto(
                assetService.getFieldInstance(companyId, assetId, fieldInstanceId), embedChildren);
    }
}
