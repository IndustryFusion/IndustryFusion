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

import { Aggregator } from './oisp.model';

export class KairosRequest {
  // tslint:disable-next-line:variable-name
  start_absolute: number;
  // tslint:disable-next-line:variable-name
  end_absolute?: number;
  metrics: MetricsWithAggregationAndGrouping[];
}

export class MetricsWithAggregationAndGrouping {
  name: string;
  limit?: number;
  // tslint:disable-next-line:variable-name
  group_by: KairosGroupBy[];
  aggregators: Aggregator[];
}

export class KairosGroupBy {
  name: string;
  // tslint:disable-next-line:variable-name
  range_size: number;
  group?: KairosGroup;
}

export class KairosGroup {
  // tslint:disable-next-line:variable-name
  group_number: number;
}


export class KairosResponse {
  queries: KairosQuery[];
}

export class KairosQuery {
  // tslint:disable-next-line:variable-name
  sample_size: number;
  results: KairosResult[];
}

export class KairosResult {
  name: string;
  // tslint:disable-next-line:variable-name
  group_by: KairosGroupBy[];
  tags: KairosTags;
  values: number[][];
}

export class KairosTags {
  type: string[];
}


export class KairosResponseGroup {
  index: number;
  timestamps?: number[];
  results: number[];
}

export class KairosResponseValues {
  timestamp: number;
  value: number;
}

export class OispStatus {
  id: string;
  status: OispDeviceStatus;
}

export enum OispDeviceStatus {
  OFFLINE = 0,
  IDLE = 1,
  RUNNING = 2,
  ERROR = 3
}
