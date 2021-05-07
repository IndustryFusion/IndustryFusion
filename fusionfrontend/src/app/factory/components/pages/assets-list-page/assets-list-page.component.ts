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
import { Observable } from 'rxjs';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { Asset } from 'src/app/store/asset/asset.model';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { Company } from 'src/app/store/company/company.model';
import { Location } from 'src/app/store/location/location.model';
import { LocationQuery } from 'src/app/store/location/location.query';
import { Room } from 'src/app/store/room/room.model';
import { AssetDetails, AssetDetailsWithFields } from '../../../../store/asset-details/asset-details.model';
import { ID } from '@datorama/akita';
import { FactoryManagerPageType, RouteData } from 'src/app/factory/factory-routing.model';
import { AssetSeriesDetails } from '../../../../store/asset-series-details/asset-series-details.model';
import { AssetService } from '../../../../store/asset/asset.service';


@Component({
  selector: 'app-assets-list-page',
  templateUrl: './assets-list-page.component.html',
  styleUrls: ['./assets-list-page.component.scss']
})
export class AssetsListPageComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  company$: Observable<Company>;
  assets$: Observable<Asset[]>;
  assetsWithDetailsAndFields$: Observable<AssetDetailsWithFields[]>;
  locations$: Observable<Location[]>;
  assetSeries$: Observable<AssetSeriesDetails[]>;
  location$: Observable<Location>;
  rooms$: Observable<Room[]>;
  room$: Observable<Room>;
  selectedIds: Array<ID>;
  companyId: ID;
  createdAssetDetailsId: ID;


  constructor(
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
    this.room$ = this.factoryResolver.room$;
    this.assets$ = this.factoryResolver.assets$;
    this.assetSeries$ = this.factoryResolver.assetSeries$;
    this.companyId = this.activatedRoute.snapshot.paramMap.get('companyId');
    this.assetsWithDetailsAndFields$ = this.factoryResolver.assetsWithDetailsAndFields$;
  }

  ngOnDestroy() {
  }

  createAssetFromAssetSeries(event: AssetSeriesDetails) {
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
    );
  }

  updateAssetData(event: AssetDetails) {
    event.id = event.id ? event.id : this.createdAssetDetailsId;
    event.companyId = this.companyId;
    this.assetService.updateCompanyAsset(this.companyId, event).subscribe(
      res => {
        console.log('[location page] updated asset with id: ' + res.id);
      },
      error => console.log(error)
    );
  }

  selectTheAssets(selectedAssetIds: Set<ID>) {
    this.selectedIds = Array.from(selectedAssetIds.values());
  }

  toolbarClick(button: string) {
    const pageTypes: FactoryManagerPageType[] = (this.activatedRoute.snapshot.data as RouteData).pageTypes || [];

    if (button === 'GRID') {
      this.assetQuery.setSelectedAssetIds(this.selectedIds);
      if (pageTypes.includes(FactoryManagerPageType.ROOM_DETAIL)) {
        this.router.navigate(['asset-cards', this.selectedIds.join(',')], { relativeTo: this.activatedRoute });
      } else {
        this.router.navigate(['..', 'asset-cards', this.selectedIds.join(',')], { relativeTo: this.activatedRoute });
      }
    }
  }
}
