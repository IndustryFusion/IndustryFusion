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

import io.fusion.fusionbackend.dto.FieldInstanceDto;
import io.fusion.fusionbackend.dto.mappers.FieldInstanceMapper;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.enums.QuantityDataType;
import io.fusion.fusionbackend.rest.annotations.IsFleetUser;
import io.fusion.fusionbackend.service.FieldInstanceService;
import io.fusion.fusionbackend.service.FieldService;
import io.fusion.fusionbackend.service.QuantityTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@IsFleetUser
public class FieldInstanceRestService {
    private final FieldInstanceService fieldInstanceService;
    private final FieldService fieldService;
    private final FieldInstanceMapper fieldInstanceMapper;
    private final QuantityTypeService quantityTypeService;

    @Autowired
    public FieldInstanceRestService(FieldInstanceService fieldInstanceService,
                                    FieldService fieldService,
                                    FieldInstanceMapper fieldInstanceMapper,
                                    QuantityTypeService quantityTypeService) {
        this.fieldInstanceService = fieldInstanceService;
        this.fieldService = fieldService;
        this.fieldInstanceMapper = fieldInstanceMapper;
        this.quantityTypeService = quantityTypeService;
    }

    @PostMapping(path = "/companies/{companyId}/fieldinstances/are-thresholds-valid")
    public boolean areFieldInstancesThresholdsValid(@PathVariable final Long companyId,
                                                    @RequestBody final FieldInstanceDto fieldInstanceDto) {

        final Field field = fieldService.getField(fieldInstanceDto.getFieldSource().getFieldTarget().getFieldId(), false);
        final QuantityDataType quantityDataType = quantityTypeService
                .getQuantityType(fieldInstanceDto.getFieldSource().getSourceUnit().getQuantityTypeId())
                .getDataType();

        return fieldInstanceService.areThresholdsValid(fieldInstanceMapper.toEntity(fieldInstanceDto),
                field.getThresholdType(), quantityDataType);
    }
}
