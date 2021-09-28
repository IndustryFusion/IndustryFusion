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

import { EntityState, QueryEntity, getIDType, ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map, skipWhile, take } from 'rxjs/operators';
import { BaseEntity } from './baseentity.model';
import { BaseSubtitleQuery } from './basesubtitlequery.model';

export class BaseQueryEntity<S extends EntityState, T extends BaseEntity, IDType = getIDType<S>>
  extends QueryEntity<S, T, IDType> implements BaseSubtitleQuery<T> {

  waitForActive(): Observable<T> {
    return this._selectActive()
      .pipe(
        skipWhile(entity => {
          return entity == null || (entity && String(entity.id) !== String(this.getActiveId()));
        }),
        take(1));
  }

  private _selectActive(): Observable<T> {
    return this.selectActive() as Observable<T>;
  }

  waitForEntities(ids: ID[]): Observable<T[]> {
    return this.selectAll()
      .pipe(
        skipWhile(entities => {
          const entityIds = entities.map(entity => entity.id);
          return ids.every(id => entityIds.includes(id));
        }),
        take(1));
  }

  selectSubtitleName(entity: any): Observable<string> {
    return this.selectEntity(entity.id).pipe(map((item: any) => item.name));
  }
}
