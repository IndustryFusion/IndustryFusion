import { EntityState, getIDType, ID, QueryEntity } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map, mergeMap, skipWhile, take } from 'rxjs/operators';
import { BaseEntity } from './baseentity.model';
import { CachedStore } from './cachedstore';

export class BaseQueryEntityCached<S extends EntityState, T extends BaseEntity, IDType = getIDType<S>>
  extends QueryEntity<S, T, IDType> {

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

  waitForActives(): Observable<T> {
    return this._selectActive()
      .pipe(
        skipWhile(entity => {
          return entity == null || (entity && String(entity.id) !== String(this.getActiveId()));
        }));
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
}

export class IdWithChildren<T extends BaseEntity> {
  constructor(parentId: ID, children: T[]) {
    this.parentId = parentId;
    this.children = children;
  }
  parentId: ID;
  children: T[];
}
