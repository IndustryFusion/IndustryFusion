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

export class Room extends BaseEntity {
  factorySiteId: ID;
  factorySite: FactorySite;
  name: string;
  description: string;
  assetIds: Array<ID>;
  assets: Array<Asset>;
}
