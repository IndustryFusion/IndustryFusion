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
import { AssetTypeTemplateQuery } from '../asset-type-template/asset-type-template.query';
import { AssetTypeTemplate } from '../asset-type-template/asset-type-template.model';
import { AssetTypeQuery } from '../asset-type/asset-type.query';

@Injectable({ providedIn: 'root' })
export class AssetTypesComposedQuery {

  constructor(
    protected assetTypeQuery: AssetTypeQuery,
    protected assetTypeTemplateQuery: AssetTypeTemplateQuery) { }

  selectTemplatesOfAssetType(assetTypeId: ID): Observable<AssetTypeTemplate[]> {
    return combineQueries([
      this.assetTypeTemplateQuery.selectAll(),
      this.assetTypeQuery.selectAssetType(assetTypeId)])
      .pipe(
        map(([templates, assetType]) => {
          return templates.filter(template => String(assetType.id) === String(template.assetTypeId));
        }));
  }

  selectUnpublishedTemplatesOfAssetType(assetTypeId: ID): Observable<AssetTypeTemplate[]> {
    return combineQueries([
      this.assetTypeTemplateQuery.selectAll(),
      this.assetTypeQuery.selectAssetType(assetTypeId)])
      .pipe(
        map(([templates, assetType]) => {
          return templates.filter(template => String(assetType.id) === String(template.assetTypeId) && !template.published);
        }));
  }
}
