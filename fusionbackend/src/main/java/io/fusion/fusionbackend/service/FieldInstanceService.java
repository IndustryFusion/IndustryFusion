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

package io.fusion.fusionbackend.service;

import io.fusion.fusionbackend.model.FieldInstance;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.model.enums.FieldThresholdType;
import io.fusion.fusionbackend.model.enums.QuantityDataType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FieldInstanceService {
    private final ThresholdService thresholdService;
    private final UnitService unitService;

    private static final Logger LOG = LoggerFactory.getLogger(AssetService.class);

    @Autowired
    public FieldInstanceService(ThresholdService thresholdService, UnitService unitService) {
        this.thresholdService = thresholdService;
        this.unitService = unitService;
    }

    public FieldInstance initFieldInstanceDraft(FieldSource fieldSource) {
        if (fieldSource == null) {
            return null;
        }

        return FieldInstance.builder()
                .fieldSource(fieldSource)
                .name(fieldSource.getName())
                .description(fieldSource.getDescription())
                .sourceSensorLabel(fieldSource.getSourceSensorLabel())
                .absoluteThreshold(thresholdService.initThresholdDraft(fieldSource.getAbsoluteThreshold()))
                .idealThreshold(thresholdService.initThresholdDraft(fieldSource.getIdealThreshold()))
                .criticalThreshold(thresholdService.initThresholdDraft(fieldSource.getCriticalThreshold()))
                .value(fieldSource.getValue())
                .build();
    }

    public boolean areThresholdsValid(FieldInstance fieldInstance,
                                      FieldThresholdType fieldThresholdType,
                                      QuantityDataType quantityDataType) {

        final int absoluteThresholdValuesCount = ThresholdService
                .getFilledValuesCount(fieldInstance.getAbsoluteThreshold());
        final int idealThresholdValuesCount = ThresholdService
                .getFilledValuesCount(fieldInstance.getIdealThreshold());
        final int criticalThresholdValuesCount = ThresholdService
                .getFilledValuesCount(fieldInstance.getCriticalThreshold());

        final boolean existNoThresholdValues = absoluteThresholdValuesCount == 0 && idealThresholdValuesCount == 0
                && criticalThresholdValuesCount == 0;
        final boolean existPairwiseValues = this.existPairwiseValues(absoluteThresholdValuesCount,
                idealThresholdValuesCount, criticalThresholdValuesCount);
        final boolean existBothAbsoluteThresholdValuesAndPairwiseValues = absoluteThresholdValuesCount == 2
                && existPairwiseValues;

        if (!quantityDataType.equals(QuantityDataType.NUMERIC)) {
            return existNoThresholdValues;
        }

        switch (fieldThresholdType) {
            case MANDATORY:
                return existBothAbsoluteThresholdValuesAndPairwiseValues;
            case OPTIONAL:
                return existNoThresholdValues || existBothAbsoluteThresholdValuesAndPairwiseValues;
            case DISABLED:
                return existNoThresholdValues;
            default:
                return false;
        }
    }

    public void validate(FieldInstance fieldInstance) {
        if (fieldInstance.getFieldSource() == null) {
            throw new RuntimeException("Field instance must have a FieldSource");
        }

        final FieldThresholdType fieldThresholdType = fieldInstance.getFieldSource()
                .getFieldTarget()
                .getField()
                .getThresholdType();

        final Unit unit = unitService.getUnit(fieldInstance.getFieldSource().getSourceUnit().getId());
        final QuantityDataType quantityDataType = unit.getQuantityType().getDataType();

        if (!areThresholdsValid(fieldInstance, fieldThresholdType, quantityDataType)) {
            LOG.warn("Thresholds of field instance with id {} are not valid.\r\n"
                            + "Absolute Threshold: {}, ideal Threshold: {}, critical threshold: {}",
                    fieldInstance.getId(), fieldInstance.getAbsoluteThreshold(),
                    fieldInstance.getIdealThreshold(), fieldInstance.getCriticalThreshold());
            throw new RuntimeException("Thresholds are not valid in every field instance");
        }
    }

    private boolean existPairwiseValues(final int absoluteValuesCount,
                                        final int idealValuesCount,
                                        final int criticalValuesCount) {
        return (absoluteValuesCount == 0 || absoluteValuesCount == 2)
                && (idealValuesCount == 0 || idealValuesCount == 2)
                && (criticalValuesCount == 0 || criticalValuesCount == 2);
    }
}
