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
import { Observable, zip } from 'rxjs';
import { FieldSourceQuery } from '../field-source/field-source.query';
import { map } from 'rxjs/operators';
import { UnitQuery } from '../unit/unit.query';
import { FieldSource } from '../field-source/field-source.model';
import { FieldTargetQuery } from '../field-target/field-target.query';

@Injectable({ providedIn: 'root'})
export class FieldSourceComposedQuery {

  constructor(private fieldSourceQuery: FieldSourceQuery,
              private fieldTargetQuery: FieldTargetQuery,
              private unitQuery: UnitQuery) {
  }


  selectFieldSourcesWithUnits(): Observable<FieldSource[]> {
    return combineQueries([
      this.fieldSourceQuery.getAllFieldSource(),
      this.unitQuery.selectAll()
    ]).pipe(
      map(([fieldSources, units]) => {
        fieldSources = fieldSources.map<FieldSource>(fieldSource => {
          fieldSource = { ...fieldSource};
          fieldSource.sourceUnit = units.find(unit => unit.id === fieldSource.sourceUnitId);
          return fieldSource;
        });
        return fieldSources;
      }),
    );
  }

  selectFieldSourcesWithUnitsAndFildTargetsByAssetSeries(assetSeriesId: ID): Observable<FieldSource[]> {
    return combineQueries([
      this.fieldSourceQuery.getAllFieldSource(),
      this.fieldTargetQuery.selectAll(),
      this.unitQuery.selectAll()
    ]).pipe(
      map(([fieldSources, fieldTargets, units]) => {
        fieldSources = fieldSources.map<FieldSource>(fieldSource => {
          fieldSource = { ...fieldSource};
          fieldSource.sourceUnit = units.find(unit => unit.id === fieldSource.sourceUnitId);
          fieldSource.fieldTarget = fieldTargets.find(fieldTarget => fieldTarget.id === fieldSource.fieldTargetId);
          return fieldSource;
        });
        fieldSources = fieldSources.filter(fieldSource => {
          // tslint:disable-next-line:triple-equals
          return fieldSource.assetSeriesId == assetSeriesId;
        });
        return fieldSources;
      }),
    );
  }

  selectLoading(): Observable<boolean> {
    return zip([
      this.fieldSourceQuery.selectLoading,
      this.unitQuery.selectLoading
    ]).pipe(
      map(([fieldSourceLoading, unitLoading]) => {
        return fieldSourceLoading && unitLoading;
      })
    );
  }
}
