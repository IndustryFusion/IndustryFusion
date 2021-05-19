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

import { Component, EventEmitter, OnInit, Output, ViewChild, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Location } from 'src/app/store/location/location.model';
import { ID } from '@datorama/akita';
import { AgmMap } from '@agm/core';
import { ActivatedRoute, Router } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-locations-map',
  templateUrl: './locations-map.component.html',
  styleUrls: ['./locations-map.component.scss']
})

export class LocationsMapComponent implements OnInit, OnChanges {

  @Input()
  locations: Location[];
  @Input()
  location: Location;
  @Input()
  modalMode = false;

  mapType = 'terrain';

  companyId: ID;
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
  defaultLatitude = 50;
  defaultLongitude = 10;
  height = 330;
  zoom = 5;
  private geocoder: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.geocoder = new google.maps.Geocoder();
    if (this.modalMode) {
      this.zoom = 7;
      this.height = 460;
      this.defaultLatitude = 48.5;
    }
  }

  navigateToLocation(id: ID): void {
    this.router.navigate(['locations', id], { relativeTo: this.route });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.modalMode && changes.location && (this.location.zip || this.location.city)) {
      const address = this.location.line1 + ' ' + this.location.zip + ' ' + this.location.city + ' ' + this.location.country;
      this.placeMarkerForLocation(address);
    }
  }

  placeMarkerForLocation(address) {
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }
    this.geocoder.geocode({
      address
    }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
        this.location.latitude = results[0].geometry.location.lat();
        this.location.longitude = results[0].geometry.location.lng();
        this.defaultLatitude = results[0].geometry.location.lat();
        this.defaultLongitude = results[0].geometry.location.lng();
      }
    });
  }

}
