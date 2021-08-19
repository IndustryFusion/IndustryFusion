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
import { Asset } from 'src/app/store/asset/asset.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
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
  factorySite: FactorySite;

  @Input()
  roomCount: number;

  @Input()
  assets: Asset[];

  temperature$: Observable<number>;

  date: number = Date.now();
  imgUrl: string;

  constructor(private weatherService: WeatherService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.factorySite && this.factorySite) {
      this.temperature$ = this.weatherService.getTemperatureForFactorySite(this.factorySite.city);
      if (this.factorySite && this.factorySite.imageKey) {
        this.imgUrl = 'assets/img/' + this.factorySite.imageKey;
      } else {
        this.imgUrl = 'assets/img/company.png';
      }
    }
  }
}
