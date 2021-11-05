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

import io.fusion.fusionbackend.model.Threshold;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ThresholdService {

    @Autowired
    public ThresholdService() {
    }

    public Threshold initThresholdDraft(Threshold sourceThreshold) {
        if (sourceThreshold == null) {
            return null;
        }

        return Threshold.builder()
                .valueUpper(sourceThreshold.getValueUpper())
                .valueLower(sourceThreshold.getValueLower())
                .build();
    }

    public static int getFilledValuesCount(Threshold threshold) {
        if (threshold == null) {
            return 0;
        }
        return ((threshold.getValueUpper() != null) ? 1 : 0) + ((threshold.getValueLower() != null) ? 1 : 0);
    }

    public static boolean hasPairwiseValues(Threshold threshold) {
        final int thresholdValuesCount = ThresholdService.getFilledValuesCount(threshold);
        return thresholdValuesCount == 0 || thresholdValuesCount == 2;
    }

    public static boolean hasBothValues(Threshold threshold) {
        final int thresholdValuesCount = ThresholdService.getFilledValuesCount(threshold);
        return thresholdValuesCount == 2;
    }

    public static boolean hasNoValue(Threshold threshold) {
        final int thresholdValuesCount = ThresholdService.getFilledValuesCount(threshold);
        return thresholdValuesCount == 0;
    }
}
