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

import io.fusion.fusionbackend.dto.AssetSeriesDetailsDto;
import io.fusion.fusionbackend.dto.AssetSeriesDto;
import io.fusion.fusionbackend.dto.mappers.AssetSeriesDetailsMapper;
import io.fusion.fusionbackend.dto.mappers.AssetSeriesMapper;
import io.fusion.fusionbackend.rest.annotations.IsFleetUser;
import io.fusion.fusionbackend.service.AssetSeriesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
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
public class AssetSeriesRestService {
    private final AssetSeriesService assetSeriesService;
    private final AssetSeriesMapper assetSeriesMapper;
    private final AssetSeriesDetailsMapper assetSeriesDetailsMapper;

    @Autowired
    public AssetSeriesRestService(AssetSeriesService assetSeriesService,
                                  AssetSeriesMapper assetSeriesMapper,
                                  AssetSeriesDetailsMapper assetSeriesDetailsMapper) {
        this.assetSeriesService = assetSeriesService;
        this.assetSeriesMapper = assetSeriesMapper;
        this.assetSeriesDetailsMapper = assetSeriesDetailsMapper;
    }

    @GetMapping(path = "/companies/{companyId}/assetseries")
    public Set<AssetSeriesDto> getAssetSeriesSet(@PathVariable final Long companyId,
                                                 @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetSeriesMapper.toDtoSet(assetSeriesService.getAssetSeriesSetByCompany(companyId), embedChildren);
    }

    @SuppressWarnings("checkstyle:LineLength")
    @GetMapping(path = "/companies/{companyId}/assetseriesdetails")
    public Set<AssetSeriesDetailsDto> getAssetSeriesDetailsSet(@PathVariable final Long companyId,
                                                               @RequestParam(defaultValue = "true")
                                                               final boolean embedChildren) {
        return assetSeriesDetailsMapper.toDtoSet(assetSeriesService.getAssetSeriesSetByCompany(companyId),
                embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}")
    public AssetSeriesDto getAssetSeries(@PathVariable final Long companyId,
                                         @PathVariable final Long assetSeriesId,
                                         @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetSeriesMapper.toDto(
                assetSeriesService.getAssetSeriesByCompany(companyId, assetSeriesId), embedChildren);
    }

    @PostMapping(path = "/companies/{companyId}/assetseries")
    public AssetSeriesDto createAssetSeriesFromAssetTypeTemplate(@PathVariable final Long companyId,
                                                                 @RequestBody final AssetSeriesDto assetSeriesDto) {
        return assetSeriesMapper.toDto(
                assetSeriesService.createAssetSeries(companyId, assetSeriesDto.getAssetTypeTemplateId(), assetSeriesMapper.toEntity(assetSeriesDto)),
                false);
    }

    @PatchMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}")
    public AssetSeriesDto updateAssetSeries(@PathVariable final Long companyId,
                                            @PathVariable final Long assetSeriesId,
                                            @RequestBody final AssetSeriesDto assetSeriesDto) {
        return assetSeriesMapper.toDto(assetSeriesService.updateAssetSeries(companyId, assetSeriesId,
                assetSeriesMapper.toEntity(assetSeriesDto)), false);
    }

    @DeleteMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}")
    public void deleteAssetSeries(@PathVariable final Long companyId,
                                  @PathVariable final Long assetSeriesId) {
        assetSeriesService.deleteAssetSeries(companyId, assetSeriesId);
    }
}
