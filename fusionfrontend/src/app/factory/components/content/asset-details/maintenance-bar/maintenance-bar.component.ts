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

import { Component, Input, OnInit } from '@angular/core';

import { MaintenanceInterval } from './maintenance-interval.model';

@Component({
  selector: 'app-maintenance-bar',
  templateUrl: './maintenance-bar.component.html',
  styleUrls: ['./maintenance-bar.component.scss']
})
export class MaintenanceBarComponent implements OnInit {

  @Input()
  maintenanceValues: MaintenanceInterval;

  maxProgress = 1500;

  constructor() {
  }

  ngOnInit() {

  }

  toNumber(value: string): number {
      return value ? parseInt(value, 10) : 0;
  }

  // getMaintenanceIntervalValue(): number {
  //   return  this.maintenanceIntervalField ? parseInt(this.maintenanceIntervalField.value, 10) : 0;
  // }

  // getHoursTillFieldValue(): number {
  //   return this.hoursTillField ? parseInt(this.hoursTillField.value, 10) : 0;
  // }
}
