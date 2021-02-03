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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { Asset } from 'src/app/store/asset/asset.model';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { Company } from 'src/app/store/company/company.model';
import { Location } from 'src/app/store/location/location.model';
import { LocationQuery } from 'src/app/store/location/location.query';
import { Room } from 'src/app/store/room/room.model';
import { AssetDetails, AssetDetailsWithFields } from '../../../../store/asset-details/asset-details.model';
import { CompanyQuery } from '../../../../store/company/company.query';
import { AssetSeriesDetails } from '../../../../store/asset-series-details/asset-series-details.model';
import { AssetService } from '../../../../store/asset/asset.service';

@Component({
  selector: 'app-location-page',
  templateUrl: './location-page.component.html',
  styleUrls: ['./location-page.component.scss']
})
export class LocationPageComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  company$: Observable<Company>;
  locations$: Observable<Location[]>;
  location$: Observable<Location>;
  rooms$: Observable<Room[]>;
  allRoomsOfLocation$: Observable<Room[]>;
  assetSeries$: Observable<AssetSeriesDetails[]>;
  assets$: Observable<Asset[]>;
  assetsWithDetailsAndFields$: Observable<AssetDetailsWithFields[]>;
  selectedIds: ID[];
  companyId: ID;
  selectedAssetSeries: AssetSeriesDetails;
  createdAssetDetailsId: ID;

  constructor(
    private companyQuery: CompanyQuery,
    private locationQuery: LocationQuery,
    private assetQuery: AssetQuery,
    private assetService: AssetService,
    private factoryResolver: FactoryResolver,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading$ = this.locationQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.company$ = this.factoryResolver.company$;
    this.locations$ = this.factoryResolver.locations$;
    this.location$ = this.factoryResolver.location$;
    this.rooms$ = this.factoryResolver.rooms$;
    this.allRoomsOfLocation$ = this.factoryResolver.allRoomsOfLocation$;
    this.assetSeries$ = this.factoryResolver.assetSeries$;
    this.assets$ = this.factoryResolver.assets$;
    this.companyId = this.companyQuery.getActiveId();
    this.assetsWithDetailsAndFields$ = this.factoryResolver.assetsWithDetailsAndFields$;
  }

  ngOnDestroy() {
  }

  selectTheAssets(selectedAssetIds: Set<ID>) {
    this.selectedIds = Array.from(selectedAssetIds.values());
  }

  createAssetFromAssetSeries(event: AssetSeriesDetails) {
    this.selectedAssetSeries = event;
    const targetCompanyId = this.companyId;
    const sourceCompanyId = event.companyId;
    const assetSeriesId = event.id;
    const createAsset$ = this.assetService.createAssetFromAssetSeries(targetCompanyId, assetSeriesId, sourceCompanyId);
    createAsset$.subscribe(
      id => {
        console.log('[location page] created asset id: ' + id);
        this.createdAssetDetailsId = id;
      },
      error => console.log(error)
    )
  }

  updateAssetData(event: AssetDetails) {
    event.id = event.id ? event.id : this.createdAssetDetailsId;
    event.companyId = this.companyId;
    this.assetService.updateCompanyAsset(this.companyId, event).subscribe(
      res => {
        console.log('[location page] updated asset with id: ' + res.id);
      },
      error => console.log(error)
    )
  }

  toolbarClick(button: string) {
    if (button === 'GRID') {
      this.assetQuery.setSelectedAssetIds(this.selectedIds);
      this.router.navigate(['asset-cards', this.selectedIds.join(',')], { relativeTo: this.activatedRoute })
    }
  }
}
