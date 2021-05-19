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

import io.fusion.fusionbackend.dto.QuantityTypeDto;
import io.fusion.fusionbackend.dto.mappers.QuantityTypeMapper;
import io.fusion.fusionbackend.rest.annotations.IsEcosystemUser;
import io.fusion.fusionbackend.service.QuantityTypeService;
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
public class QuantityTypeRestService {
    private final QuantityTypeService quantityTypeService;
    private final QuantityTypeMapper quantityTypeMapper;

    @Autowired
    public QuantityTypeRestService(QuantityTypeService quantityTypeService, QuantityTypeMapper quantityTypeMapper) {
        this.quantityTypeService = quantityTypeService;
        this.quantityTypeMapper = quantityTypeMapper;
    }

    @GetMapping(path = "/quantitytypes")
    public Set<QuantityTypeDto> getAllQuantityTypes(@RequestParam(defaultValue = "false") final boolean embedChildren) {
        return quantityTypeMapper.toDtoSet(quantityTypeService.getAllQuantityTypes(), embedChildren);
    }

    @GetMapping(path = "/quantitytypes/{quantityTypeId}")
    public QuantityTypeDto getQuantityType(@PathVariable final Long quantityTypeId,
                                           @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return quantityTypeMapper.toDto(quantityTypeService.getQuantityType(quantityTypeId),
                embedChildren);
    }

    @PostMapping(path = "/quantitytypes")
    public QuantityTypeDto createQuantityType(@RequestBody final QuantityTypeDto quantityTypeDto) {
        return quantityTypeMapper.toDto(
                quantityTypeService.createQuantityType(quantityTypeMapper.toEntity(quantityTypeDto)),
                false);
    }

    @PatchMapping(path = "/quantitytypes/{quantityTypeId}")
    public QuantityTypeDto updateQuantityType(@PathVariable final Long quantityTypeId,
                                              @RequestBody final QuantityTypeDto quantityTypeDto) {
        return quantityTypeMapper.toDto(
                quantityTypeService.updateQuantityType(quantityTypeId, quantityTypeMapper.toEntity(quantityTypeDto)),
                false);
    }

    @DeleteMapping(path = "/quantitytypes/{quantityTypeId}")
    public void deleteQuantityType(@PathVariable final Long quantityTypeId) {
        quantityTypeService.deleteQuantityType(quantityTypeId);
    }

    @PutMapping(path = "/quantitytypes/{quantityTypeId}")
    public QuantityTypeDto setBaseUnit(@PathVariable final Long quantityTypeId,
                                       @RequestParam final Long baseUnitId) {
        return quantityTypeMapper.toDto(quantityTypeService.setQuantityTypeBaseUnit(quantityTypeId, baseUnitId),
                false);
    }
}
