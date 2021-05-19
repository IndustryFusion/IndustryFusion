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

import io.fusion.fusionbackend.dto.AssetTypeTemplateDto;
import io.fusion.fusionbackend.dto.mappers.AssetTypeTemplateMapper;
import io.fusion.fusionbackend.rest.annotations.IsEcosystemUser;
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@IsEcosystemUser
public class AssetTypeTemplateRestService {
    private final AssetTypeTemplateService assetTypeTemplateService;
    private final AssetTypeTemplateMapper assetTypeTemplateMapper;

    @Autowired
    public AssetTypeTemplateRestService(AssetTypeTemplateService assetTypeTemplateService,
                                        AssetTypeTemplateMapper assetTypeTemplateMapper) {
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.assetTypeTemplateMapper = assetTypeTemplateMapper;
    }

    @GetMapping(path = "/assettypetemplates")
    public Set<AssetTypeTemplateDto> getAssetTypeTemplates(@RequestParam(defaultValue = "false")
                                                               final boolean embedChildren) {
        return assetTypeTemplateMapper.toDtoSet(assetTypeTemplateService.getAssetTypeTemplates(), embedChildren);
    }

    @GetMapping(path = "/assettypetemplates/{assetTypeTemplateId}")
    public AssetTypeTemplateDto getAssetTypeTempl(@PathVariable final Long assetTypeTemplateId,
                                                  @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetTypeTemplateMapper.toDto(
                assetTypeTemplateService.getAssetTypeTemplate(assetTypeTemplateId, embedChildren),
                embedChildren);
    }

    @PostMapping(path = "/assettypetemplates")
    public AssetTypeTemplateDto createAssetTypeTemplate(@RequestParam final Long assetTypeId,
                                                        @RequestBody final AssetTypeTemplateDto assetTypeTemplateDto) {
        return assetTypeTemplateMapper.toDto(
                assetTypeTemplateService.createAssetTypeTemplate(assetTypeId,
                        assetTypeTemplateMapper.toEntity(assetTypeTemplateDto)), false);
    }

    @PatchMapping(path = "/assettypetemplates/{assetTypeTemplateId}")
    public AssetTypeTemplateDto updateAssetTypeTemplate(@PathVariable final Long assetTypeTemplateId,
                                                        @RequestBody final AssetTypeTemplateDto assetTypeTemplateDto) {
        return assetTypeTemplateMapper.toDto(assetTypeTemplateService.updateAssetTypeTemplate(assetTypeTemplateId,
                assetTypeTemplateMapper.toEntity(assetTypeTemplateDto)), false);
    }

    @DeleteMapping(path = "/assettypetemplates/{assetTypeTemplateId}")
    public void deleteAssetTypeTemplate(@PathVariable final Long assetTypeTemplateId) {
        assetTypeTemplateService.deleteAssetTypeTemplate(assetTypeTemplateId);
    }

    @PutMapping(path = "/assettypetemplates/fields/{fieldId}") // TODO: unused parameter
    public AssetTypeTemplateDto setFieldUnit(@PathVariable final Long assetTypeTemplateId,
                                             @RequestParam final Long assetTypeId) {
        return assetTypeTemplateMapper.toDto(assetTypeTemplateService.setAssetType(assetTypeTemplateId,
                assetTypeId), false);
    }
}
