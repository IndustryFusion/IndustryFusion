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

import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { AssetDetailsWithFields } from 'src/app/store/asset-details/asset-details.model'

@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss']
})
export class MaintenanceListComponent implements OnInit, OnChanges {

  @Input()
  assetsWithDetailsAndFields: AssetDetailsWithFields[];

  displayedAssets: AssetDetailsWithFields[];

  constructor(
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.displayedAssets = this.assetsWithDetailsAndFields;
  }

  searchedForAssets(event: AssetDetailsWithFields[]){
      this.displayedAssets = event;
  }
}
