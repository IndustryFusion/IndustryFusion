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

export class OispAlert {
  id: ID;
  accountId: ID;
  alertId: ID;
  conditions: Array<OispAlertCondition>;
  created: Date;
  dashboardAlertReceivedOn: Date;
  dashboardObservationReceivedOn: Date;
  deviceUID: ID;
  naturalLangAlert: string;
  priority: OispPriority;
  reset: Date;
  resetType: string;
  ruleId: string;
  ruleName: string;
  status: OispAlertStatus;
  triggered: Date;
  updated: Date;
}

export enum OispAlertStatus {
  NEW = 'New',
  OPEN = 'Open',
  CLOSED = 'closed'
}

export enum OispPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export class OispAlertCondition {
  components: Array<OispAlertComponent>;
  condition: string;
}

export class OispAlertComponent {
  componentId: ID;
  componentName: string;
  valuePoints: Array<OispAlertValuePoint>;
}

export class OispAlertValuePoint {
  timestamp: number;
  value: string;
}
