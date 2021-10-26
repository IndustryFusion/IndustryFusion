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

import io.fusion.fusionbackend.dto.FieldSourceDto;
import io.fusion.fusionbackend.dto.mappers.FieldSourceMapper;
import io.fusion.fusionbackend.rest.annotations.IsFleetUser;
import io.fusion.fusionbackend.service.AssetSeriesService;
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

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@RestController
@IsFleetUser
public class AssetSeriesFieldSourceRestService {
    private final AssetSeriesService assetSeriesService;
    private final FieldSourceMapper fieldSourceMapper;

    @Autowired
    public AssetSeriesFieldSourceRestService(AssetSeriesService assetSeriesService,
                                             FieldSourceMapper fieldSourceMapper) {
        this.assetSeriesService = assetSeriesService;
        this.fieldSourceMapper = fieldSourceMapper;
    }

    @GetMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/fieldsources")
    public List<FieldSourceDto> getFieldSources(@PathVariable final Long companyId,
                                               @PathVariable final Long assetSeriesId,
                                               @RequestParam(defaultValue = "false") final boolean embedChildren) {
        Set<FieldSourceDto> unsortedFieldSources = fieldSourceMapper
                .toDtoSet(assetSeriesService.getFieldSources(companyId, assetSeriesId), embedChildren);

        List<FieldSourceDto> sortedFieldSources = new ArrayList<>(unsortedFieldSources);
        sortedFieldSources.sort(Comparator.comparing(FieldSourceDto::getId));
        return  sortedFieldSources;
    }

    @GetMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/fieldsources/{fieldSourceId}")
    public FieldSourceDto getFieldSource(@PathVariable final Long companyId,
                                         @PathVariable final Long assetSeriesId,
                                         @PathVariable final Long fieldSourceId,
                                         @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return fieldSourceMapper.toDto(
                assetSeriesService.getFieldSource(companyId, assetSeriesId, fieldSourceId), embedChildren);
    }

    // Note: this is left here for optional fields
    @PostMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/fieldsources")
    public FieldSourceDto createFieldSource(@PathVariable final Long companyId,
                                            @PathVariable final Long assetSeriesId,
                                            @RequestParam final Long fieldTargetId,
                                            @RequestParam final Long unitId,
                                            @RequestBody final FieldSourceDto fieldSourceDto) {
        return fieldSourceMapper.toDto(
                assetSeriesService.createFieldSource(companyId, assetSeriesId, fieldTargetId, unitId,
                        fieldSourceMapper.toEntity(fieldSourceDto)), false);
    }

    @PatchMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/fieldsources/{fieldSourceId}")
    public FieldSourceDto updateFieldSource(@PathVariable final Long companyId,
                                            @PathVariable final Long assetSeriesId,
                                            @PathVariable final Long fieldSourceId,
                                            @RequestBody final FieldSourceDto fieldSourceDto) {
        return fieldSourceMapper.toDto(assetSeriesService.updateFieldSource(companyId, assetSeriesId,
                fieldSourceId, fieldSourceMapper.toEntity(fieldSourceDto)), false);
    }

    // Note: this is left here for optional fields
    @DeleteMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/fieldsources/{fieldSourceId}")
    public void deleteFieldSource(@PathVariable final Long companyId,
                                  @PathVariable final Long assetSeriesId,
                                  @PathVariable final Long fieldSourceId) {
        assetSeriesService.deleteFieldSource(companyId, assetSeriesId, fieldSourceId);
    }

    @PutMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/fieldsources/{fieldSourceId}")
    public void linkUnitToFieldSource(@PathVariable final Long companyId,
                         @PathVariable final Long assetSeriesId,
                         @PathVariable final Long fieldSourceId,
                         @RequestParam final Long unitId) {
        assetSeriesService.linkUnitToFieldSource(companyId, assetSeriesId, fieldSourceId, unitId);
    }
}
