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
  export function getTypeTitle(type: ThresholdType) {
    switch (type) {
      case ThresholdType.ABSOLUTE:
        return 'Absolute lower & upper limit *';
      case ThresholdType.IDEAL:
        return 'Ideal range';
      case ThresholdType.CRITICAL:
        return 'Critical alert range';
    }
  }

  export function getLowerLimitTitle(type: ThresholdType) {
    switch (type) {
      case ThresholdType.ABSOLUTE:
        return 'Absolute lower limit';
      case ThresholdType.IDEAL:
        return 'Lower ideal threshold';
      case ThresholdType.CRITICAL:
        return 'Lower critical alert threshold';
    }
  }

  export function getUpperLimitTitle(type: ThresholdType) {
    switch (type) {
      case ThresholdType.ABSOLUTE:
        return 'Absolute upper limit';
      case ThresholdType.IDEAL:
        return 'Upper ideal threshold';
      case ThresholdType.CRITICAL:
        return 'Upper critical alert threshold';
    }
  }
}
