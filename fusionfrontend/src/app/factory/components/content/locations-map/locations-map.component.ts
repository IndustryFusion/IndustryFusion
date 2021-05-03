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

import { Component, EventEmitter, OnInit, Output, ViewChild, OnDestroy, Input } from '@angular/core';
import { LocationQuery } from 'src/app/store/location/location.query';
import { Location } from 'src/app/store/location/location.model';
import { ID } from '@datorama/akita';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { AgmMap } from '@agm/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-locations-map',
  templateUrl: './locations-map.component.html',
  styleUrls: ['./locations-map.component.scss']
})

export class LocationsMapComponent implements OnInit, OnDestroy {

  @Input()
  location: Location;

  private unSubscribe$ = new Subject<void>();

  mapType = 'terrain';
  defaultLatitude = 50;
  defaultLongitude = 10;

  companyId: ID;
  locations: Location[];
  @Output() selectedLocation = new EventEmitter<ID>();

  styles =
    [
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#d3d3d3'
          }
        ]
      },
      {
        featureType: 'transit',
        stylers: [
          {
            color: '#808080'
          },
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
          {
            visibility: 'on'
          },
          {
            color: '#b3b3b3'
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#ffffff'
          }
        ]
      },
      {
        featureType: 'road.local',
        elementType: 'geometry.fill',
        stylers: [
          {
            visibility: 'on'
          },
          {
            color: '#ffffff'
          },
          {
            weight: 1.8
          }
        ]
      },
      {
        featureType: 'road.local',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#d7d7d7'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'geometry.fill',
        stylers: [
          {
            visibility: 'on'
          },
          {
            color: '#ebebeb'
          }
        ]
      },
      {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [
          {
            color: '#a7a7a7'
          }
        ]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#ffffff'
          }
        ]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#ffffff'
          }
        ]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry.fill',
        stylers: [
          {
            visibility: 'on'
          },
          {
            color: '#efefef'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#696969'
          }
        ]
      },
      {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
          {
            visibility: 'on'
          },
          {
            color: '#737373'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'labels.icon',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#d6d6d6'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels.icon',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      { },
      {
        featureType: 'poi',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#dadada'
          }
        ]
      }
    ];


  @ViewChild('AgmMap', { static: true })
  agmMap: AgmMap;
  lng: number;
  lat: number;
  address;


  constructor(private companyQuery: CompanyQuery,
              private locationQuery: LocationQuery,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.companyId = this.companyQuery.getActiveId();
    this.locationQuery.selectLocationsOfCompany(this.companyId)
      .pipe(
        takeUntil(this.unSubscribe$)
      ).subscribe(
        res => {
          this.locations = res;
        });
  }

  navigateToLocation(id: ID): void {
    this.router.navigate(['locations', id], { relativeTo: this.route });
  }

  ngOnChange() {
    console.log(this.location);
  }

  placeMarker(event) {
    console.log(this.location);
    console.log(event.coords.lat);
    console.log(event.coords.lng);
    console.log(event);
    console.log(event.coords);


    navigator.geolocation.getCurrentPosition( pos => {
      this.lng = +pos.coords.longitude;
      this.lat = +pos.coords.latitude;
    })
    // this.getAddress(event.coords.lng, event.coords.lat);
  }


  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
}
