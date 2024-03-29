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
import { Asset } from 'src/app/core/store/asset/asset.model';
import { AssetQuery } from 'src/app/core/store/asset/asset.query';
import { Company } from 'src/app/core/store/company/company.model';
import { FactorySite } from 'src/app/core/store/factory-site/factory-site.model';
import { FactorySiteQuery } from 'src/app/core/store/factory-site/factory-site.query';
import { Room } from 'src/app/core/store/room/room.model';
import {
  FactoryAssetDetails,
  FactoryAssetDetailsWithFields
} from '../../../../core/store/factory-asset-details/factory-asset-details.model';
import { CompanyQuery } from '../../../../core/store/company/company.query';
import { AssetService } from '../../../../core/store/asset/asset.service';
import { RoomService } from '../../../../core/store/room/room.service';
import { FactorySiteService } from '../../../../core/store/factory-site/factory-site.service';

@Component({
  selector: 'app-factory-site-page',
  templateUrl: './factory-site-page.component.html',
  styleUrls: ['./factory-site-page.component.scss']
})
export class FactorySitePageComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  company$: Observable<Company>;
  factorySites$: Observable<FactorySite[]>;
  factorySite$: Observable<FactorySite>;
  rooms$: Observable<Room[]>;
  roomsOfFactorySite$: Observable<Room[]>;
  assets$: Observable<Asset[]>;
  factoryAssetDetailsWithFields$: Observable<FactoryAssetDetailsWithFields[]>;
  selectedIds: ID[];
  companyId: ID;
  createdAssetDetailsId: ID;

  constructor(
    private companyQuery: CompanyQuery,
    private factorySiteQuery: FactorySiteQuery,
    private factorySiteService: FactorySiteService,
    private assetQuery: AssetQuery,
    private assetService: AssetService,
    private factoryResolver: FactoryResolver,
    private roomService: RoomService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading$ = this.factorySiteQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.company$ = this.factoryResolver.company$;
    this.factorySites$ = this.factoryResolver.factorySites$;
    this.factorySite$ = this.factoryResolver.factorySite$;
    this.rooms$ = this.factoryResolver.rooms$;
    this.roomsOfFactorySite$ = this.factoryResolver.roomsOfFactorySite$;
    this.assets$ = this.factoryResolver.assets$;
    this.companyId = this.companyQuery.getActiveId();
    this.factoryAssetDetailsWithFields$ = this.factoryResolver.assetsWithDetailsAndFields$;

    if (this.factorySiteQuery.getActive() == null) {
      this.factorySite$.subscribe(factorySite => { if (factorySite) { this.factorySiteService.setActive(factorySite.id); } });
    }
  }

  ngOnDestroy() {
  }

  selectAssets(selectedAssetIds: ID[]) {
    this.selectedIds = selectedAssetIds;
  }

  toolbarClick(button: string) {
    if (button === 'GRID') {
      this.assetQuery.setSelectedAssetIds(this.selectedIds);
      this.router.navigate(['asset-cards', this.selectedIds.join(',')], { relativeTo: this.activatedRoute });
    }
  }

  updateRoom(event: [Room, FactoryAssetDetails]) {
    const oldRoom: Room = event[0];
    const assetDetails: FactoryAssetDetails = event[1];

    assetDetails.id = assetDetails.id ? assetDetails.id : this.createdAssetDetailsId;
    this.assetService.updateCompanyAsset(assetDetails.companyId, assetDetails).subscribe(
      () => {
        if (oldRoom.id !== assetDetails.roomId) {
          this.roomService.updateRoomsAfterEditAsset(oldRoom.id, assetDetails);
        }
      },
      error => console.error(error)
    );
  }
}
