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

import { ID } from '@datorama/akita';

export class OispRequest {
  from: number;
  to?: number;
  targetFilter: Filter;
  metrics: Metrics[];
}

export class OispRequestWithAggregation extends OispRequest {
  maxItems?: number;
}

export class Filter {
  deviceList: string[];
}

export class Metrics {
  id: string;
  op: string;
}

export class MetricsWithAggregation extends Metrics {
  aggregator: Aggregator;
}

export class Aggregator {
  name: string;
  sampling?: Sampling;
}

export class Sampling {
  unit: string;
  value: number;
}

export class OispResponse {
  series: Series[];
  pointsLimit: number;
}

export class Series {
  deviceId: string;
  deviceName: string;
  componentId: string;
  componentName: string;
  componentType: string;
  points: Point[];
}

export class Point {
    ts: number;
    value: string;
}

export class PointWithId {
  id: string;
  ts: number;
  value: string;
}

export class PointWithIdAndDate {
  id: string;
  date: Date;
  value: string;
}

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

export class ComponentType {
  id: string;
  dimension: string;
  version: string;
  default: boolean;
  type: string;
  dataType: ComponentDataType;
  format: string;
  min: number;
  max: number;
  measureunit: string;
  display: string;
  href: string;
}

export enum ComponentDataType {
  Number = 'Number',
  String = 'String',
  Boolean = 'Boolean',
  ByteArray = 'ByteArray',
}

export enum BaselineCalculationLevel {
  'Device level' = 'Device level',
}

export class DeviceComponent {
  cid: string;
  componentType: ComponentType;
  componentTypeId: string;
  name: string;
  type: string;
}

export class Device {
  components: DeviceComponent[];
  deviceId: string;
  gatewayId: string;
  name: string;
  tags: string[];
  status: string;
  uid: ID;
}

export enum ConditionType {
  basic = 'basic',
  time = 'time',
  statistics = 'statistics',
}

export function displayConditionType(type: ConditionType): string {
  switch (type){
    case ConditionType.basic:
      return 'Basic Condition';
    case ConditionType.time:
      return 'Timebased Condition';
    case ConditionType.statistics:
      return 'Statistic based Condition';
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

export class OISPUser {
  id: string;
  created: Date;
  updated: Date;
  email: string;
}
