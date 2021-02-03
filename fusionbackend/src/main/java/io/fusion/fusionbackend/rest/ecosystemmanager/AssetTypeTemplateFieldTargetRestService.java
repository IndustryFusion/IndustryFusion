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

import io.fusion.fusionbackend.dto.FieldTargetDto;
import io.fusion.fusionbackend.dto.mappers.FieldTargetMapper;
import io.fusion.fusionbackend.rest.annotations.IsEcosystemUser;
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
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
public class AssetTypeTemplateFieldTargetRestService {
    private final AssetTypeTemplateService assetTypeTemplateService;
    private final FieldTargetMapper fieldTargetMapper;

    @Autowired
    public AssetTypeTemplateFieldTargetRestService(AssetTypeTemplateService assetTypeTemplateService,
                                                   FieldTargetMapper fieldTargetMapper) {
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.fieldTargetMapper = fieldTargetMapper;
    }

    @GetMapping(path = "/assettypetemplates/{assetTypeTemplateId}/fieldtargets")
    public Set<FieldTargetDto> getFieldTargets(@PathVariable final Long assetTypeTemplateId) {
        return fieldTargetMapper.toDtoSet(assetTypeTemplateService.getFieldTargets(assetTypeTemplateId));
    }

    @GetMapping(path = "/assettypetemplates/{assetTypeTemplateId}/fieldtargets/{fieldTargetId}")
    public FieldTargetDto getFieldTarget(@PathVariable final Long assetTypeTemplateId,
                                         @PathVariable final Long fieldTargetId,
                                         @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return fieldTargetMapper.toDto(
                assetTypeTemplateService.getFieldTarget(assetTypeTemplateId, fieldTargetId), embedChildren);
    }

    @PostMapping(path = "/assettypetemplates/{assetTypeTemplateId}/fieldtargets")
    public FieldTargetDto createFieldTarget(@PathVariable final Long assetTypeTemplateId,
                                            @RequestParam final Long fieldId,
                                            @RequestBody final FieldTargetDto fieldTargetDto) {
        return fieldTargetMapper.toDto(
                assetTypeTemplateService.createFieldTarget(assetTypeTemplateId, fieldId,
                        fieldTargetMapper.toEntity(fieldTargetDto)), false);
    }

    @PatchMapping(path = "/assettypetemplates/{assetTypeTemplateId}/fieldtargets/{fieldTargetId}")
    public FieldTargetDto updateFieldTarget(@PathVariable final Long assetTypeTemplateId,
                                            @PathVariable final Long fieldTargetId,
                                            @RequestBody final FieldTargetDto fieldTargetDto) {
        return fieldTargetMapper.toDto(assetTypeTemplateService.updateFieldTarget(assetTypeTemplateId,
                fieldTargetId, fieldTargetMapper.toEntity(fieldTargetDto)), false);
    }

    @DeleteMapping(path = "/assettypetemplates/{assetTypeTemplateId}/fieldtargets/{fieldTargetId}")
    public void deleteFieldTarget(@PathVariable final Long assetTypeTemplateId,
                                  @PathVariable final Long fieldTargetId) {
        assetTypeTemplateService.deleteFieldTarget(assetTypeTemplateId, fieldTargetId);
    }
}
