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

declare var google: any;

@Injectable({
  providedIn: 'root'
})
// To use this you have to import the AgmCoreModule in xyz.module.ts (and add <agm-map [hidden]="true"></agm-map>)
export class GeocoderService {

  private geocoder: google.maps.Geocoder;

  constructor() {
  }

  public getGeocode(street: string, zip: string, city: string, countryName: string, callback): void {
    if (!this.geocoder) {
      // can not be initialized in constructor
      this.geocoder = new google.maps.Geocoder();
    }

    const address: string = street + ' ' + zip + ' ' + city + ' ' + countryName;

    this.geocoder.geocode({
      address
    }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
        const coordinate: Coordinate = new Coordinate();
        coordinate.latitude = results[0].geometry.location.lat();
        coordinate.longitude = results[0].geometry.location.lng();
        callback(coordinate);
      } else {
        throw new Error('Geocoordinate could not be retrieved! Return status is ' + status);
      }
    });
  }
}

export class Coordinate {
  latitude: number;
  longitude: number;
}
