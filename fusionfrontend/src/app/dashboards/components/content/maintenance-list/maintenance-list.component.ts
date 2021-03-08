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

import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { AssetDetailsQuery } from 'src/app/store/asset-details/asset-details.query';
import { AssetDetailsWithFields } from 'src/app/store/asset-details/asset-details.model'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss']
})
export class MaintenanceListComponent implements OnInit {

  @Input()
  assetsWithDetailsAndFields: AssetDetailsWithFields[];

  sortField: string;
  items$: Observable<any[]>;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public assetQuery: AssetQuery,
    public assetDetailsQuery: AssetDetailsQuery,
  ) { }

  ngOnInit(): void {
    console.log("reached", this.assetsWithDetailsAndFields)
    this.items$ = this.assetDetailsQuery.selectAssetDetailsOfCompany(2);
  }

}

