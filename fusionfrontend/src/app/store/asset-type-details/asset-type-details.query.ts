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

import {Injectable} from "@angular/core";
import {BaseQueryEntity} from "../basequery";
import {ID} from "@datorama/akita";
import {Observable} from "rxjs";
import {AssetTypeDetailsState, AssetTypeDetailsStore} from "./asset-type-details.store";
import {AssetTypeDetails} from "./asset-type-details.model";

@Injectable({ providedIn: 'root' })
export class AssetTypeDetailsQuery extends BaseQueryEntity<AssetTypeDetailsState, AssetTypeDetails> {
  constructor(protected store: AssetTypeDetailsStore) {
    super(store);
  }

  selectDetailsOfAssetType(assetTypeId: ID): Observable<AssetTypeDetails> {
    return this.select(assetTypeId);
    /*{
      filterBy: entity => String(entity.id) === String(assetTypeId)
    });*/
  }
}
