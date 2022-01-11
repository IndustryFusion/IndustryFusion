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

import { BaseEntity } from '../baseentity.model';
import { TranslateService } from '@ngx-translate/core';

export class Threshold extends BaseEntity {
  valueLower: number;
  valueUpper: number;
}

export enum ThresholdType {
  ABSOLUTE = 'absolute',
  IDEAL = 'ideal',
  CRITICAL = 'critical',
}

// tslint:disable-next-line:no-namespace
export namespace ThresholdType {
  export function getTypeTitle(type: ThresholdType, translation: TranslateService) {
    switch (type) {
      case ThresholdType.ABSOLUTE:
        return translation.instant('APP.CORE.STORE.THRESHOLD.ABSOLUT_LOWER_AND_UPPER_LIMIT');
        // return 'Absolute lower & upper limit *';
      case ThresholdType.IDEAL:
        return translation.instant('APP.CORE.STORE.THRESHOLD.IDEAL_RANGE');
        // return 'Ideal range';
      case ThresholdType.CRITICAL:
        return translation.instant('APP.CORE.STORE.THRESHOLD.CRITICAL_ALERT_RANGE');
        // return 'Critical alert range';
    }
  }

  export function getLowerLimitTitle(type: ThresholdType, translation: TranslateService) {
    switch (type) {
      case ThresholdType.ABSOLUTE:
        return translation.instant('APP.CORE.STORE.THRESHOLD.ABSOLUTE_LOWER_LIMIT');
        // return 'Absolute lower limit';
      case ThresholdType.IDEAL:
        return translation.instant('APP.CORE.STORE.THRESHOLD.LOWER_IDEAL_THRESHOLD');
        // return 'Lower ideal threshold';
      case ThresholdType.CRITICAL:
        return translation.instant('APP.CORE.STORE.THRESHOLD.LOWER_CRITICAL_ALERT_THRESHOLD');
      // return 'Lower critical alert threshold';
    }
  }

  export function getUpperLimitTitle(type: ThresholdType, translation: TranslateService) {
    switch (type) {
      case ThresholdType.ABSOLUTE:
        return translation.instant('APP.CORE.STORE.THRESHOLD.ABSOLUTE_UPPER_LIMIT');
      // return 'Absolute upper limit';
      case ThresholdType.IDEAL:
        return translation.instant('APP.CORE.STORE.THRESHOLD.UPPER_IDEAL_THRESHOLD');
        // return 'Upper ideal threshold';
      case ThresholdType.CRITICAL:
        return translation.instant('APP.CORE.STORE.THRESHOLD.UPPER_CRITICAL_ALERT_THRESHOLD');
        // return 'Upper critical alert threshold';
    }
  }
}
