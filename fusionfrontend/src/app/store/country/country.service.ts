import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { tap } from 'rxjs/operators';
import { Country } from './country.model';
import { CountryStore } from './country.store';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CountryService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private countryStore: CountryStore, private http: HttpClient) {
  }

  getItems(): Observable<Country[]> {
    const path = `countries`;
    return this.http.get<Country[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.countryStore.upsertMany(entities);
      }));
  }

  getItem(countryId: ID): Observable<Country> {
    const path = `countries/${countryId}`;
    return this.http.get<Country>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.countryStore.upsert(countryId, entity);
      }));
  }
}
