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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { WeatherResponse } from './weather.model';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', Authorization: 'Api-Key ' + environment.weatherApiKey })
  };

  constructor(private http: HttpClient) { }

  getTemperatureForLocation(cityName: string): Observable<number> {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${environment.weatherApiKey}&q=${cityName}`
    return timer(0, 5000).pipe(
      switchMap(() => this.http.get<WeatherResponse>(weatherUrl).pipe(
      map(data => data.main.temp - 273.15) // kelvin to celsius
    ))
    )
  }

}
