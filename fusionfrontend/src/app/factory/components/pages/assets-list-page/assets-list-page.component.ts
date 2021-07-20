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
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { FactorySiteQuery } from 'src/app/store/factory-site/factory-site.query';
import { Room } from 'src/app/store/room/room.model';
import { FactoryAssetDetails, FactoryAssetDetailsWithFields } from '../../../../store/factory-asset-details/factory-asset-details.model';
import { ID } from '@datorama/akita';
import { FactoryManagerPageType, RouteData } from 'src/app/factory/factory-routing.model';
import { AssetService } from 'src/app/store/asset/asset.service';
import { AssetSeriesDetailsResolver } from 'src/app/resolvers/asset-series-details-resolver.service';
import { RoomService } from '../../../../store/room/room.service';


@Component({
  selector: 'app-assets-list-page',
  templateUrl: './assets-list-page.component.html',
  styleUrls: ['./assets-list-page.component.scss']
})
export class AssetsListPageComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  company$: Observable<Company>;
  assets$: Observable<Asset[]>;
  factoryAssetDetailsWithFields$: Observable<FactoryAssetDetailsWithFields[]>;
  factorySites$: Observable<FactorySite[]>;
  rooms$: Observable<Room[]>;
  room$: Observable<Room>;
  selectedIds: Array<ID>;
  companyId: ID;
  createdAssetDetailsId: ID;


  constructor(
    private factorySiteQuery: FactorySiteQuery,
    private assetQuery: AssetQuery,
    private assetService: AssetService,
    private factoryResolver: FactoryResolver,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
    private roomService: RoomService,
  ) { }

  ngOnInit() {
    this.isLoading$ = this.factorySiteQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.assetSeriesDetailsResolver.resolve(this.activatedRoute.snapshot);
    this.company$ = this.factoryResolver.company$;
    this.factorySites$ = this.factoryResolver.factorySites$;
    this.rooms$ = this.factoryResolver.rooms$;
    this.room$ = this.factoryResolver.room$;
    this.assets$ = this.factoryResolver.assets$;
    this.companyId = this.activatedRoute.snapshot.paramMap.get('companyId');
    this.factoryAssetDetailsWithFields$ = this.factoryResolver.assetsWithDetailsAndFields$;
  }

  ngOnDestroy() {
  }

  updateAssetData(event: [Room, FactoryAssetDetails]) {
    event[1].id = event[1].id ? event[1].id : this.createdAssetDetailsId;
    this.assetService.updateCompanyAsset(event[1].companyId, event[1]).subscribe(
      res => {
        console.log('[factory site page] updated asset with id: ' + res.id);
        if (event[0].id !== event[1].roomId) {
          this.roomService.updateRoomsAfterEditAsset(event[0].id, event[1]);
        }
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
