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
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { FieldSourceService } from '../store/field-source/field-source.service';
import { FieldSource } from '../store/field-source/field-source.model';
import { Observable } from 'rxjs';
import { RouteHelpers } from '../common/utils/route-helpers';
import { ID } from '@datorama/akita';

@Injectable({ providedIn: 'root' })
export class FieldSourceResolver implements Resolve<FieldSource[]>{
  constructor(private fieldSourceService: FieldSourceService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<FieldSource[]> {
    const companyId: ID = RouteHelpers.findParamInFullActivatedRoute(route.pathFromRoot[1], 'companyId');
    const assetSeriesId: ID = RouteHelpers.findParamInFullActivatedRoute(route, 'assetSeriesId');
    if (companyId != null && assetSeriesId != null) {
      return this.fieldSourceService.getFieldSourcesOfAssetSeries(companyId, assetSeriesId);
    }
  }
}
