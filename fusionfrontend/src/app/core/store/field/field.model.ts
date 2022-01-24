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

export class Field extends BaseEntity {
  name: string;
  description: string;
  label: string;
  accuracy: number;
  unitId: ID;
  unit: any;
  thresholdType: FieldThresholdType;
  widgetType: FieldWidgetType;
  creationDate: Date;
  dataType: FieldDataType;
  enumOptions: FieldOption[];
}

export class FieldOption extends BaseEntity {
  fieldId: ID;
  optionLabel: string;

  public constructor(fieldId: ID, optionsLabel: string) {
    super();
    this.fieldId = fieldId;
    this.optionLabel = optionsLabel;
  }
}

export enum FieldThresholdType {
  OPTIONAL = 'OPTIONAL',
  MANDATORY = 'MANDATORY',
  DISABLED = 'DISABLED',
}

export enum FieldWidgetType {
  STATUS = 'STATUS',
  RAW = 'RAW',
  GAUGE = 'GAUGE',
  BARCHART = 'BARCHART'
}

export enum FieldDataType {
  NUMERIC = 'NUMERIC',
  ENUM = 'ENUM'
}
