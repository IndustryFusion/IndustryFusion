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
import { Room } from '../room/room.model';
import { Country } from '../country/country.model';

export class FactorySite extends BaseEntity {
  companyId: ID;
  roomIds: Array<ID>;
  rooms: Array<Room>;
  name: string;
  line1: string;
  line2: string;
  city: string;
  zip: string;
  countryId: ID;
  country: Country;
  imageKey: string;
  latitude: number;
  longitude: number;
  type: FactorySiteType;
}

export class FactorySiteWithAssetCount extends FactorySite {
  assetCount: number;
}

export enum FactorySiteType {
  HEADQUARTER = 'HEADQUARTER',
  FABRICATION = 'FABRICATION',
  FLEETMANAGER = 'FLEETMANAGER',
}
