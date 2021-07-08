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

import io.fusion.fusionbackend.dto.FieldDetailsDto;
import io.fusion.fusionbackend.dto.FieldInstanceDto;
import io.fusion.fusionbackend.dto.mappers.FieldDetailsMapper;
import io.fusion.fusionbackend.dto.mappers.FieldInstanceMapper;
import io.fusion.fusionbackend.rest.annotations.IsFactoryUser;
import io.fusion.fusionbackend.service.AssetService;
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
@IsFactoryUser
public class FactoryAssetFieldRestService {
    private final AssetService assetService;
    private final FieldInstanceMapper fieldInstanceMapper;
    private final FieldDetailsMapper fieldDetailsMapper;

    @Autowired
    public FactoryAssetFieldRestService(AssetService assetService,
                                        FieldInstanceMapper fieldInstanceMapper,
                                        FieldDetailsMapper fieldDetailsMapper) {
        this.assetService = assetService;
        this.fieldInstanceMapper = fieldInstanceMapper;
        this.fieldDetailsMapper = fieldDetailsMapper;
    }

    @GetMapping(path = "/companies/{companyId}/locations/{locationId}/rooms/{roomId}/assets/{assetId}/fieldinstances")
    public Set<FieldInstanceDto> getFieldInstancesCheckFullPath(@PathVariable final Long companyId,
                                                                @PathVariable final Long locationId,
                                                                @PathVariable final Long roomId,
                                                                @PathVariable final Long assetId,
                                                                @RequestParam(defaultValue = "false")
                                                                    final boolean embedChildren) {
        return fieldInstanceMapper.toDtoSet(
                assetService.getFieldInstancesCheckFullPath(companyId, locationId, roomId, assetId), embedChildren);
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

    @GetMapping(path = "/companies/{companyId}/assets/{assetId}/fields")
    public Set<FieldDetailsDto> getFieldDetails(@PathVariable final Long companyId,
                                                @PathVariable final Long assetId,
                                                @RequestParam(defaultValue = "true") final boolean embedChildren) {
        return fieldDetailsMapper.toDtoSet(assetService.getFieldInstances(companyId, assetId), embedChildren);
    }


    // TODO: this should probably not be allowed
    @PostMapping(path = "/companies/{companyId}/assets/{assetId}/fieldinstances")
    public FieldInstanceDto createFieldInstance(@PathVariable final Long companyId,
                                                @PathVariable final Long assetId,
                                                @RequestBody final FieldInstanceDto fieldInstanceDto) {
        return fieldInstanceMapper.toDto(
                assetService.createFieldInstance(companyId, assetId,
                        fieldInstanceMapper.toEntity(fieldInstanceDto)), false);
    }

    // TODO: what values should be allowed to be changed
    @PatchMapping(path = "/companies/{companyId}/assets/{assetId}/fieldinstances/{fieldInstanceId}")
    public FieldInstanceDto updateFieldInstance(@PathVariable final Long companyId,
                                                @PathVariable final Long assetId,
                                                @PathVariable final Long fieldInstanceId,
                                                @RequestBody final FieldInstanceDto fieldInstanceDto) {
        return fieldInstanceMapper.toDto(assetService.updateFieldInstance(companyId, assetId,
                fieldInstanceId, fieldInstanceMapper.toEntity(fieldInstanceDto)), false);
    }

    // TODO: this should probably not be allowed
    @DeleteMapping(path = "/companies/{companyId}/assets/{assetId}/fieldinstances/{fieldInstanceId}")
    public void deleteField(@PathVariable final Long companyId,
                            @PathVariable final Long assetId,
                            @PathVariable final Long fieldInstanceId) {
        assetService.deleteFieldInstance(companyId, assetId, fieldInstanceId);
    }
}
