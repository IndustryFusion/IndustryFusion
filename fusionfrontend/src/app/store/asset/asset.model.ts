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
import { BaseEntity } from '../baseentity.model';
import { FieldDetails } from '../field-details/field-details.model';
import { FieldInstance } from '../field-instance/field-instance.model';
import { Room } from '../room/room.model';

export class Asset extends BaseEntity {
  companyId: ID;
  assetSeriesId: ID;
  fieldInstanceIds: Array<ID>;
  fieldInstances: Array<FieldInstance>;
  roomId: ID;
  room: Room;
  externalId: string;
  controlSystemType: string;
  hasGateway: boolean;
  gatewayConnectivity: string;
  name: string;
  description: string;
  guid: string;
  ceCertified: boolean;
  serialNumber: string;
  constructionDate: Date;
  protectionClass: string;
  handbookKey: string;
  videoKey: string;
  installationDate: Date;
  imageKey: string;
}

export class AssetWithFields extends Asset {
  fields: FieldDetails[];
}
