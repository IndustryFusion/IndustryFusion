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
import { ID } from '@datorama/akita';
import { FieldWidgetType } from '../field/field.model';
import { Threshold } from '../threshold/threshold.model';
import { DeviceComponent } from '../oisp/oisp-device/oisp-device.model';

// Data come from entities field_instance, field_target and field
export class FieldDetails extends BaseEntity {
  assetId: ID;
  externalName: string;
  fieldType: FieldType;
  mandatory: boolean;
  name: string;
  description: string;
  dashboardGroup: string;
  type: string;
  unit: string;
  accuracy: number;
  value: string;
  quantityDataType: QuantityDataType;
  widgetType: FieldWidgetType;
  absoluteThreshold: Threshold;
  idealThreshold: Threshold;
  criticalThreshold: Threshold;
}

export enum FieldType {
  ATTRIBUTE = 'ATTRIBUTE',
  METRIC = 'METRIC'
}

export enum QuantityDataType {
  CATEGORICAL = 'CATEGORICAL',
  NUMERIC = 'NUMERIC'
}

export class MetricDetail {
  externalName: string;
  fieldDetails: FieldDetails;
  deviceComponent: DeviceComponent;
  latestValue: number | string;
}
