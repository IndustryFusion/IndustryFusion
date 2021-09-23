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
import { FieldTargetQuery } from '../field-target/field-target.query';
import { FieldTarget } from '../field-target/field-target.model';
import { FieldQuery } from '../field/field.query';

@Injectable({ providedIn: 'root' })
export class FieldTargetComposedQuery {

  constructor(protected fieldTargetQuery: FieldTargetQuery,
              private fieldQuery: FieldQuery) {
  }

  selectAll(): Observable<FieldTarget[]> {
    return combineQueries([
      this.fieldTargetQuery.selectAll(),
      this.fieldQuery.selectAll()
    ]).pipe(
          map(([fieldTargets, fields]) => {
            fieldTargets = [ ...fieldTargets];

            for (let i = 0; i < fieldTargets.length; i++) {
              const fieldTarget = new FieldTarget();
              fieldTarget.id = fieldTargets[i].id;
              fieldTarget.version = fieldTargets[i].version;
              fieldTarget.assetTypeTemplateId = fieldTargets[i].assetTypeTemplateId;
              fieldTarget.fieldId = fieldTargets[i].fieldId;
              fieldTarget.field = fields.find(field => field.id === fieldTargets[i].fieldId);
              fieldTarget.fieldType = fieldTargets[i].fieldType;
              fieldTarget.mandatory = fieldTargets[i].mandatory;
              fieldTarget.label = fieldTargets[i].label;
              fieldTarget.name = fieldTargets[i].name;
              fieldTarget.description = fieldTargets[i].description;

              fieldTargets[i] = fieldTarget;
            }

            return fieldTargets;
          })
    );
  }

}
