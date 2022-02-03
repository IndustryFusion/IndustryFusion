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

import { ComponentDataType } from '../oisp-device/oisp-device.model';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class Rule {
  id: string;
  externalId: string;
  name: string;
  description: string;
  owner: string;
  naturalLanguage: string;
  type: RuleType;
  creationDate: Date;
  lastUpdateDate: Date;
  resetType: RuleResetType;
  priority: string;
  status: RuleStatus;
  synchronizationStatus: SynchronizationStatus;
  population: {
    ids: string[],
  };
  conditions: RuleConditions;
  actions: RuleAction[];
}

export class RuleAction {
  type: RuleActionType;
  target: string[];
  // tslint:disable-next-line:variable-name
  http_headers: [string, string][];
}

export enum RuleStatus {
  Active = 'Active',
  Draft = 'Draft',
  OnHold = 'On-hold',
  Archived = 'Archived',
  Deleted = 'Deleted',
}

export enum RulePrority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum RuleType {
  Regular = 'Regular',
}

export enum RuleResetType {
  Manual = 'Manual',
  Automatic = 'Automatic',
}

export enum SynchronizationStatus {
  NotSync = 'NotSync',
  Sync = 'Sync',
}

export enum RuleActionType {
  mail = 'mail',
  http = 'http',
  actuation = 'actuation',
}

export enum BaselineCalculationLevel {
  'Device level' = 'Device level',
}

export enum ConditionType {
  basic = 'basic',
  time = 'time',
  statistics = 'statistics',
}

export function displayConditionType(type: ConditionType, translate: TranslateService): Observable<string> {
  switch (type){
    case ConditionType.basic:
      return translate.get('APP.CORE.STORE.OISP-RULE.BASIC_CONDITION');
    case ConditionType.time:
      return translate.get('APP.CORE.STORE.OISP-RULE.TIME_BASED_CONDITION');
    case ConditionType.statistics:
      return translate.get('APP.CORE.STORE.OISP-RULE.STATISTIC_BASED_CONDITION');
  }
}

export enum ConditionsOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum ConditionValueOperator {
  '>' = '>',
  '<' = '<',
  '<=' = '<=',
  '>=' = '>=',
  'Not Equal' = 'Not Equal',
  'Equal' = 'Equal',
  'Between' = 'Between',
  'Not Between' = 'Not Between',
  'Like' = 'Like',
}

export class RuleConditions {
  operator: ConditionsOperator;
  values: ConditionValue[];
}

export class ConditionValue {
  component: ConditionValueComponent;
  conditionSequence?: number;
  type: ConditionType;
  operator: ConditionValueOperator;
  values: string[];
  timeLimit?: number;
  baselineCalculationLevel?: BaselineCalculationLevel;
  baselineSecondsBack?: number;
  baselineMinimalInstances?: number;
}

export class ConditionValueComponent {
  name?: string;
  dataType: ComponentDataType;
  cid?: string;
}
