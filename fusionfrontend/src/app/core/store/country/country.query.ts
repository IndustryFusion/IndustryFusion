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
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { BaseQueryEntity } from '../basequery';
import { Country } from './country.model';
import { CountryState, CountryStore } from './country.store';

@Injectable({ providedIn: 'root' })
export class CountryQuery extends BaseQueryEntity<CountryState, Country> {

  constructor(protected store: CountryStore) {
    super(store);
  }

  selectCountries(): Observable<Country[]> {
    return this.selectAll();
  }

  selectCountry(countryId: ID): Observable<Country> {
    return this.selectEntity(countryId);
  }

  resetStore() {
    this.store.reset();
  }

  resetError() {
    this.store.setError(null);
  }
}
