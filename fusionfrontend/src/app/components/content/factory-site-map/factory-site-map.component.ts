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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { ID } from '@datorama/akita';
import { AgmMap } from '@agm/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Coordinate, GeocoderService } from '../../../services/geocoder.service';

@Component({
  selector: 'app-factory-site-map',
  templateUrl: './factory-site-map.component.html',
  styleUrls: ['./factory-site-map.component.scss']
})

export class FactorySiteMapComponent implements OnInit, OnChanges {

  @Input()
  factorySites: FactorySite[];
  @Input()
  factorySite: FactorySite;
  @Input()
  modalMode = false;

  mapType = 'terrain';

  companyId: ID;
  @Output() selectedFactorySite = new EventEmitter<ID>();

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private geocoderService: GeocoderService) { }

  ngOnInit(): void {
    if (this.modalMode) {
      this.zoom = 7;
      this.height = 460;
      this.defaultLatitude = 48.5;
    }
  }

  navigateToFactorySite(id: ID): void {
    this.router.navigate(['factory-sites', id], { relativeTo: this.route });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.modalMode && changes.factorySite && (this.factorySite.zip || this.factorySite.city)) {
      this.placeMarkerForFactorySite(this.factorySite);
    }
  }

  placeMarkerForFactorySite(factorySite: FactorySite) {
    this.geocoderService.getGeocode(factorySite.line1,
          factorySite.zip,
          factorySite.city,
          factorySite.country.name,
      (coordinate: Coordinate) => {
        console.log('coordinate', coordinate);
        this.factorySite.latitude = coordinate.latitude;
        this.factorySite.longitude = coordinate.longitude;
        console.log('factorySite', this.factorySite);
        this.defaultLatitude = coordinate.latitude;
        this.defaultLongitude = coordinate.longitude;
      });
  }

}
