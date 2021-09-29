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

package io.fusion.fusionbackend.dto.mappers;

import io.fusion.fusionbackend.dto.FieldDetailsDto;
import io.fusion.fusionbackend.model.FieldInstance;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.model.enums.FieldType;
import io.fusion.fusionbackend.model.enums.QuantityDataType;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class FieldDetailsMapper extends EntityDetailsDtoMapper<FieldInstance, FieldDetailsDto> {

    @Override
    protected FieldDetailsDto toDtoDeep(FieldInstance entity) {
        if (entity == null) {
            return null;
        }
        FieldType fieldType = null;
        Boolean mandatory = null;
        String unit = null;
        Double accuracy = null;
        QuantityDataType dataType = null;
        if (entity.getFieldSource() != null) {
            FieldTarget fieldTarget = entity.getFieldSource().getFieldTarget();
            if (fieldTarget != null) {
                fieldType = fieldTarget.getFieldType();
                mandatory = fieldTarget.getMandatory();
                if (fieldTarget.getField() != null) {
                    unit = fieldTarget.getField().getUnit().getSymbol();
                    accuracy = fieldTarget.getField().getAccuracy();
                    dataType = fieldTarget.getField().getUnit().getQuantityType().getDataType();
                }
            }
        }

        return FieldDetailsDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .assetId(EntityDtoMapper.getEntityId(entity.getAsset()))
                .externalName(entity.getExternalName())
                .fieldType(fieldType)
                .mandatory(mandatory)
                .name(entity.getName())
                .description(entity.getDescription())
                .type("type not implemented")
                .unit(unit)
                .accuracy(accuracy)
                .value(entity.getValue())
                .quantityDataType(dataType)
                .build();
    }

    @Override
    public Set<Long> toEntityIdSet(Set<FieldInstance> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }
}
