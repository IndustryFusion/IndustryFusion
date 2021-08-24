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

export class Device {
  attributes: any;
  components: DeviceComponent[];
  contact: any;
  created: Date;
  deviceId: string;
  domainId: string;
  gatewayId: string;
  name: string;
  status: string;
  tags: string[];
  uid: string;
}

export class DeviceComponent {
  cid: string;
  name: string;
  componentTypeId: string;
  componentType: ComponentType;
  type: string;
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
