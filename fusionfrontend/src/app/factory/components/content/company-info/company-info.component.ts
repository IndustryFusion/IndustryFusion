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

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Room } from 'src/app/store/room/room.model';
import { Asset } from 'src/app/store/asset/asset.model';
import { Location } from 'src/app/store/location/location.model';
import { Observable } from 'rxjs';
import { WeatherService } from '../../../../services/weather.service';

@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss']
})
export class CompanyInfoComponent implements OnChanges {
  @Input()
  numUsers: number;

  @Input()
  location: Location;

  @Input()
  rooms: Room[];

  @Input()
  assets: Asset[];

  temperature$: Observable<number>;

  date: number = Date.now();
  imgUrl: string;

  constructor(private weatherService: WeatherService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.location && this.location) {
      this.temperature$ = this.weatherService.getTemperatureForLocation(this.location.city);
      if (this.location && this.location.imageKey) {
        this.imgUrl = 'assets/img/' + this.location.imageKey;
      } else {
        this.imgUrl = 'assets/img/company.png';
      }
    }
  }
}
