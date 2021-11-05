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
import { Asset } from '../asset/asset.model';
import { FactorySite } from '../factory-site/factory-site.model';

export class Company extends BaseEntity {
  factorySiteIds: Array<ID>;
  factorySites: Array<FactorySite>;
  assetIds: Array<ID>;
  assets: Array<Asset>;
  name: string;
  description: string;
  imageKey: string;
  type: CompanyType;
}

export enum CompanyType {
  MACHINE_MANUFACTURER = 'MACHINE_MANUFACTURER',
  MACHINE_CUSTOMER = 'MACHINE_CUSTOMER'
}
