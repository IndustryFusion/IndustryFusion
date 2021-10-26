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
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldInstance;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.model.enums.FieldType;
import io.fusion.fusionbackend.model.enums.FieldWidgetType;
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
        String unitSymbol = null;
        String fieldLabel = null;
        Double accuracy = null;
        String dashboardGroup = null;
        FieldWidgetType widgetType = null;
        QuantityDataType dataType = null;

        FieldSource fieldSource = entity.getFieldSource();
        if (fieldSource != null) {
            FieldTarget fieldTarget = fieldSource.getFieldTarget();
            if (fieldTarget != null) {
                fieldType = fieldTarget.getFieldType();
                mandatory = fieldTarget.getMandatory();
                dashboardGroup = fieldTarget.getDashboardGroup();

                Field field = fieldTarget.getField();
                if (field != null) {
                    accuracy = field.getAccuracy();
                    fieldLabel = field.getLabel();
                    widgetType = field.getWidgetType();
                    unitSymbol = field.getUnit().getSymbol();
                    dataType = field.getUnit().getQuantityType().getDataType();
                }
            }
        }

        return FieldDetailsDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .assetId(EntityDtoMapper.getEntityId(entity.getAsset()))
                .fieldSourceId(EntityDtoMapper.getEntityId(fieldSource))
                .externalName(entity.getExternalName())
                .fieldType(fieldType)
                .mandatory(mandatory)
                .name(entity.getName())
                .description(entity.getDescription())
                .dashboardGroup(dashboardGroup)
                .type("type not implemented")
                .unit(unitSymbol)
                .accuracy(accuracy)
                .value(entity.getValue())
                .quantityDataType(dataType)
                .widgetType(widgetType)
                .fieldLabel(fieldLabel)
                .absoluteThreshold(entity.getAbsoluteThreshold())
                .idealThreshold(entity.getIdealThreshold())
                .criticalThreshold(entity.getCriticalThreshold())
                .build();
    }

    @Override
    public Set<Long> toEntityIdSet(Set<FieldInstance> entitySet) {
        return EntityDtoMapper.getSetOfEntityIds(entitySet);
    }
}
