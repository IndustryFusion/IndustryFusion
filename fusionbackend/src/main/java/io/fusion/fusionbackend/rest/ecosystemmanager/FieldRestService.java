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

import io.fusion.fusionbackend.dto.FieldDto;
import io.fusion.fusionbackend.dto.mappers.FieldMapper;
import io.fusion.fusionbackend.dto.mappers.FieldOptionMapper;
import io.fusion.fusionbackend.rest.annotations.IsEcosystemUser;
import io.fusion.fusionbackend.service.FieldService;
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
@IsEcosystemUser
public class FieldRestService {
    private final FieldMapper fieldMapper;
    private final FieldOptionMapper fieldOptionMapper;
    private final FieldService fieldService;

    @Autowired
    public FieldRestService(FieldMapper fieldMapper, FieldOptionMapper fieldOptionMapper, FieldService fieldService) {
        this.fieldMapper = fieldMapper;
        this.fieldOptionMapper = fieldOptionMapper;
        this.fieldService = fieldService;
    }

    @GetMapping(path = "/fields")
    public List<FieldDto> getFields(@RequestParam(defaultValue = "false") final boolean embedChildren) {
        Set<FieldDto> unsortedFields = fieldMapper.toDtoSet(fieldService.getAllFields(), embedChildren);

        List<FieldDto> sortedFields = new ArrayList<>(unsortedFields);
        sortedFields.sort(Comparator.comparing(FieldDto::getId));
        return sortedFields;
    }

    @GetMapping(path = "/fields/{fieldId}")
    public FieldDto getField(@PathVariable final Long fieldId,
                             @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return fieldMapper.toDto(
                fieldService.getField(fieldId, embedChildren), embedChildren);
    }

    @PostMapping(path = "/fields")
    public FieldDto createField(@RequestParam final Long unitId, @RequestBody final FieldDto fieldDto) {
        return fieldMapper.toDto(
                fieldService.createField(fieldMapper.toEntity(fieldDto), unitId), false);
    }

    @PostMapping(path = "/fields_enum")
    public FieldDto createField(@RequestBody final FieldDto fieldDto) {
        return fieldMapper.toDto(
                fieldService.createField(fieldMapper.toEntity(fieldDto),
                        fieldOptionMapper.toEntitySet(fieldDto.getEnumOptions())), false);
    }

    @PatchMapping(path = "/fields/{fieldId}")
    public FieldDto updateField(@PathVariable final Long fieldId,
                                @RequestBody final FieldDto fieldDto) {
        return fieldMapper.toDto(fieldService.updateField(fieldId, fieldMapper.toEntity(fieldDto),
                fieldDto.getUnitId()), false);
    }

    @DeleteMapping(path = "/fields/{fieldId}")
    public void deleteField(@PathVariable final Long fieldId) {
        fieldService.deleteField(fieldId);
    }

    @PutMapping(path = "/fields/{fieldId}")
    public FieldDto setFieldUnit(@PathVariable final Long fieldId,
                                 @RequestParam final Long unitId) {
        return fieldMapper.toDto(fieldService.linkFieldUnit(fieldId, unitId), false);
    }
}
