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

export class OispRequest {
  from: number;
  to?: number;
  targetFilter: Filter;
  metrics: Metrics[];
  maxItems?: number;
}

export class OispRequestWithAggregation extends OispRequest {
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

export class OISPUser {
  id: string;
  created: Date;
  updated: Date;
  email: string;
}
