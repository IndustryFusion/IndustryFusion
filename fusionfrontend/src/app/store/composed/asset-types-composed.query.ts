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

import { Injectable } from '@angular/core';
import { combineQueries, ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {AssetTypeQuery} from "../asset-type/asset-type.query";
import {AssetTypeTemplateQuery} from "../asset-type-template/asset-type-template.query";
import {AssetTypeTemplate} from "../asset-type-template/asset-type-template.model";
import {AssetTypeWithTemplateCount} from "../asset-type/asset-type.model";

@Injectable({ providedIn: 'root' })
export class AssetTypesComposedQuery {

  //assetTypeTemplates : AssetTypeTemplate[];
  //assetType : AssetType;

  constructor(
    protected assetTypeQuery: AssetTypeQuery,
    protected assetTypeTemplateQuery: AssetTypeTemplateQuery) { }

  selectTemplatesOfAssetType(assetTypeId: ID): Observable<AssetTypeTemplate[]> {

    //this.assetTypeTemplateQuery.selectAll().subscribe(x => this.assetTypeTemplates = x);
    //this.assetTypeQuery.selectAssetType(assetTypeId).subscribe(x => this.assetType = x);

    return combineQueries([
      this.assetTypeTemplateQuery.selectAll(),
      this.assetTypeQuery.selectAssetType(assetTypeId)])
      .pipe(
        map(([templates, assetType]) => {
          return templates.filter(template => String(assetType.id) === String(template.assetTypeId));
        }));
  }

  // TODO:  selectAssetTypeWithAssetTypeTemplateCount  or  shorter like this:
  selectAssetTypeWithTemplateCount(assetTypeId: ID): Observable<AssetTypeWithTemplateCount>{

    return combineQueries([
      this.assetTypeTemplateQuery.selectAll(),
      this.assetTypeQuery.selectAssetType(assetTypeId)])
      .pipe(
        map(([templates, assetType]) => {
          const templateCount = templates.filter(template => String(assetType.id) === String(template.assetTypeId)).length;
          return Object.assign( { templateCount }, assetType );
        }));

    // return combineQueries([
    //   this.locationQuery.selectLocationsOfCompany(companyId),
    //   this.selectRoomsOfCompany(companyId),
    //   this.assetQuery.selectAssetsOfCompany(companyId)])
    //   .pipe(
    //     map(([locations, rooms, assets]) => locations.map(location => {
    //       const assetCount =
    //         assets.filter(
    //           asset => String(rooms.find(room => String(room.id) === String(asset.roomId))?.locationId) === String(location.id)).length;
    //       return Object.assign({ assetCount }, location);
    //     }))
    //   );
  }


  // TODO: selectAssetTypeWithAssetSeriesCount
  // TODO: selectAssetTypeWithAssetInstancesCount
}
