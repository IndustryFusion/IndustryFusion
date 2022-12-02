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

import { EntityStore, EntityState, getEntityType, getIDType, ID } from '@datorama/akita';
import { EMPTY, Observable, Subject } from 'rxjs';

export class CachedStore<S extends EntityState = any, EntityType = getEntityType<S>, IDType = getIDType<S>>
  extends EntityStore<S, EntityType, IDType> {

  private cachedIds: Set<ID> = new Set();
  private cachedParentIdMap: Map<ID, Set<ID>> = new Map();

  private cachedIdSubject: Subject<ID[]> = new Subject();
  private cachedParentIdMapSubject: Subject<Map<ID, Set<ID>>> = new Subject();

  /**
   * Caution: Completes observable directly (no next-call) if data exist in cache.
   * @param parentId   Id of the parent entity
   * @param request$   the request to return if not cached
   * @return  request if not cached, otherwise return EMPTY observable
   */
  cachedByParentId(parentId: ID, request$: Observable<EntityType[]>): Observable<EntityType[] | undefined | never> {
    if (this.cachedParentIdMap.has(String(parentId))) {
      return EMPTY;
    }
    return request$;
  }

  cachedOneByParentId(parentId: ID, request$: Observable<EntityType>): Observable<EntityType | undefined | never> {
    if (this.cachedParentIdMap.has(String(parentId))) {
      return EMPTY;
    }
    return request$;
  }

  /**
   * Caution: Completes observable directly (no next-call) if data exist in cache.
   * @param id         Id of the entity
   * @param request$   the request to return if not cached
   * @return  request if not cached, otherwise return EMPTY observable
   */
  cachedById(id: ID, request$: Observable<EntityType>): Observable<EntityType | undefined | never> {
    if (this.cachedIds.has(String(id))) {
      return EMPTY;
    }
    return request$;
  }

  invalidateCacheId(id: ID): void {
    this.cachedIds.delete(String(id));
  }

  invalidateCacheParentId(id: ID): void {
    this.cachedParentIdMap.delete(String(id));
  }

  setByParentIdCached(parentId: ID, entities: EntityType[]): void {
    this.addEntitiesIdsByParentId(parentId, entities);
    super.set(entities);
    this.emitCachedParentIds();
  }

  setCached(entities: EntityType[]): void {
    this.cachedIds.clear();
    this.cachedParentIdMap.clear();
    entities.forEach(entity => this.cachedIds.add(String(entity[this.idKey])));
    super.set(entities);
    this.emitCachedIds();
  }

  upsertCached(entity: EntityType): void {
    this.cachedIds.add(String(entity[this.idKey]));
    super.upsert(entity[this.idKey], entity);
    this.emitCachedIds();
  }

  upsertManyCached(entities: EntityType[]): void {
    this.upsertManyCachedInternal(entities);
  }

  upsertManyByParentIdCached(parentId: ID, entities: EntityType[]): void {
    this.addEntitiesIdsByParentId(parentId, entities);
    this.upsertManyCachedInternal(entities);
  }

  removeCached(id: IDType): void {
    this.cachedIds.delete(String(id));
    super.remove(id);
  }

  selectCachedIds(): Observable<ID[]> {
    return this.cachedIdSubject.asObservable();
  }

  selectCachedParentIdMap(): Observable<Map<ID, Set<ID>>> {
    return this.cachedParentIdMapSubject.asObservable();
  }

  private emitCachedParentIds() {
    this.cachedParentIdMapSubject.next(this.cachedParentIdMap);
  }

  private emitCachedIds() {
    this.cachedIdSubject.next(Array.from(this.cachedIds));
  }

  private upsertManyCachedInternal(entities: EntityType[]): void {
    entities.forEach(entity => this.cachedIds.add(String(entity[this.idKey])));
    super.upsertMany(entities);
    this.emitCachedIds();
  }

  private addEntitiesIdsByParentId(parentId: ID, entities: EntityType[]): void {
    entities.forEach(entity => {
      const id = String(entity[this.idKey]);
      this.cachedIds.add(String(id));
      this.addParentIdWithId(parentId, id);
    });
  }

  private addParentIdWithId(parentId: ID, childId: ID) {
    if (!this.cachedParentIdMap.has(String(parentId))) {
      this.cachedParentIdMap.set(String(parentId), new Set());
    }
    this.cachedParentIdMap.get(String(parentId)).add(String(childId));
  }
}
