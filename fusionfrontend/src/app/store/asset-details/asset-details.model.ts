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

import { Asset } from '../asset/asset.model';
import { Field } from '../field/field.model';


export class AssetDetails extends Asset {
  manufacturer: string;
  assetSeriesName: string;
  category: string;
  roomName: string;
  locationName: string;
}

export enum AssetModalType  {
  startInitialitation = 1,
  customizeAsset = 2,
  addDescription = 3,
  locationAssignment = 4,
  roomAssigntment = 5
}

export enum DashboardFilterModalType {
  assetTypeFilterModal = 1,
  manufacturerFilterModal = 2,
  factoryFilterModal = 3,
  maintenanceDueFilterModal = 4
}

export class AssetDetailsWithFields extends AssetDetails {
  fields: Field[];
}
