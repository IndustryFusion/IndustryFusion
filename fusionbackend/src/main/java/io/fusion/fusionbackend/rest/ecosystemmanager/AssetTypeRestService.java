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

package io.fusion.fusionbackend.rest.ecosystemmanager;

import io.fusion.fusionbackend.dto.AssetTypeDetailsDto;
import io.fusion.fusionbackend.dto.AssetTypeDto;
import io.fusion.fusionbackend.dto.mappers.AssetTypeMapper;
import io.fusion.fusionbackend.rest.annotations.IsEcosystemUser;
import io.fusion.fusionbackend.service.AssetTypeService;
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
@IsEcosystemUser
public class AssetTypeRestService {
    private final AssetTypeService assetTypeService;
    private final AssetTypeMapper assetTypeMapper;

    @Autowired
    public AssetTypeRestService(AssetTypeService assetTypeService, AssetTypeMapper assetTypeMapper) {
        this.assetTypeService = assetTypeService;
        this.assetTypeMapper = assetTypeMapper;
    }

    @GetMapping(path = "/assettypes")
    public Set<AssetTypeDto> getAssetTypes() {
        return assetTypeMapper.toDtoSet(assetTypeService.getAllAssetTypes());
    }

    @GetMapping(path = "/assettypes/{assetTypeId}")
    public AssetTypeDto getAssetType(@PathVariable final Long assetTypeId,
                                     @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetTypeMapper.toDto(
                assetTypeService.getAssetType(assetTypeId),
                embedChildren);
    }

    @GetMapping(path = "/assettypes/{assetTypeId}/details")
    public AssetTypeDetailsDto getAssetType(@PathVariable final Long assetTypeId) {
        return assetTypeService.getAssetTypeDetailsDto(assetTypeId);
    }

    @PostMapping(path = "/assettypes")
    public AssetTypeDto createAssetType(@RequestBody final AssetTypeDto assetTypeDto) {
        return assetTypeMapper.toDto(
                assetTypeService.createAssetType(assetTypeMapper.toEntity(assetTypeDto)), false);
    }

    @PatchMapping(path = "/assettypes/{assetTypeId}")
    public AssetTypeDto updateAssetType(@PathVariable final Long assetTypeId,
                                        @RequestBody final AssetTypeDto assetTypeDto) {
        return assetTypeMapper.toDto(assetTypeService.updateAssetType(assetTypeId,
                assetTypeMapper.toEntity(assetTypeDto)), false);
    }

    @DeleteMapping(path = "/assettypes/{assetTypeId}")
    public void deleteAssetType(@PathVariable final Long assetTypeId) {
        assetTypeService.deleteAssetType(assetTypeId);
    }
}
