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

import { EntityState, getIDType, ID, QueryEntity } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map, mergeMap, skipWhile, take } from 'rxjs/operators';
import { BaseEntity } from './baseentity.model';
import { CachedStore } from './cachedstore';
import { BaseSubtitleQuery } from './basesubtitlequery.model';

export class BaseQueryEntityCached<S extends EntityState, T extends BaseEntity, IDType = getIDType<S>>
  extends QueryEntity<S, T, IDType> implements BaseSubtitleQuery<T>{

  constructor(store: CachedStore<S>) {
    super(store);
  }

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
    return (this.store as CachedStore).selectCachedIds()
      .pipe(
        skipWhile(cachedIds => {
          return ids.every(id => cachedIds.includes(id));
        }),
        take(1),
        mergeMap(() => this.selectAll({
          filterBy: entity => ids.includes(String(entity.id))
        })));
  }

  waitForEntitiesByParents(parentIds: ID[]): Observable<IdWithChildren<T>[]> {
    return (this.store as CachedStore).selectCachedParentIdMap()
      .pipe(
        skipWhile(cachedParentIds => !parentIds.every(id => cachedParentIds.has(id))),
        take(1),
        map(cachedParentIds => Array.from(cachedParentIds).filter(entry => parentIds.includes(entry[0]))),
        map(cachedParentIds => Array.from(cachedParentIds, ([parentId, childIds]) =>
          new IdWithChildren(parentId, Array.from(childIds).map(childId => this._getEntity(childId))))));
  }

  private _getEntity(id: ID): T {
    return this.getEntity(id as unknown as IDType);
  }

  selectSubtitleName(entity: any): Observable<string> {
    return this.selectEntity(entity.id).pipe(map((item: any) => item.name));
  }
}

export class IdWithChildren<T extends BaseEntity> {
  constructor(parentId: ID, children: T[]) {
    this.parentId = parentId;
    this.children = children;
  }
  parentId: ID;
  children: T[];
}
