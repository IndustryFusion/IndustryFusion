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
import { combineQueries } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Field } from '../field/field.model';
import { FieldQuery } from '../field/field.query';
import { UnitQuery } from '../unit/unit.query';

@Injectable({ providedIn: 'root' })
export class FieldComposedQuery {

  constructor(private unitQuery: UnitQuery,
              private fieldQuery: FieldQuery) {
  }

  selectAll(): Observable<Field[]> {
    return combineQueries([
      this.fieldQuery.selectAll(),
      this.unitQuery.selectAll()
    ]).pipe(
      map(([fields, units]) => {
        fields = [ ...fields];

        for (let i = 0; i < fields.length; i++) {
          const field = { ...fields[i] };
          field.unit = units.find(unit => unit.id === fields[i].unitId);

          fields[i] = field;
        }

        return fields;
      })
    );
  }

}
