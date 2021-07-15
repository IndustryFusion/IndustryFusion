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
