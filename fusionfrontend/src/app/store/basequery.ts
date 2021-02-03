import { EntityState, QueryEntity, getIDType, ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { skipWhile, take } from 'rxjs/operators';
import { BaseEntity } from './baseentity.model';

export class BaseQueryEntity<S extends EntityState, T extends BaseEntity, IDType = getIDType<S>>
  extends QueryEntity<S, T, IDType> {

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
}
