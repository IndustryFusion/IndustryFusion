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
import { Unit } from '../unit/unit.model';
import { UnitQuery } from '../unit/unit.query';
import { QuantityTypeQuery } from '../quantity-type/quantity-type.query';

@Injectable({ providedIn: 'root' })
export class QuantityTypesComposedQuery {

  constructor(
    protected unitQuery: UnitQuery,
    protected quantityTypeQuery: QuantityTypeQuery) { }

  selectUnitsOfQuantityType(quantityTypeId: ID): Observable<Unit[]> {
    return combineQueries([
      this.unitQuery.selectAll(),
      this.quantityTypeQuery.selectEntity(quantityTypeId)])
      .pipe(
        map(([units, quantityType]) => {
          return units.filter(unit => String(quantityType.id) === String(unit.quantityTypeId));
        }));
  }
}
