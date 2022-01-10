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
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { AssetQuery } from 'src/app/core/store/asset/asset.query';
import { Company } from 'src/app/core/store/company/company.model';
import { FactorySite } from 'src/app/core/store/factory-site/factory-site.model';
import { FactorySiteQuery } from 'src/app/core/store/factory-site/factory-site.query';
import { Room } from 'src/app/core/store/room/room.model';
import {
  FactoryAssetDetails,
  FactoryAssetDetailsWithFields
} from '../../../../core/store/factory-asset-details/factory-asset-details.model';
import { ID } from '@datorama/akita';
import { AssetService } from 'src/app/core/store/asset/asset.service';
import { AssetSeriesDetailsResolver } from 'src/app/core/resolvers/asset-series-details.resolver';
import { RoomService } from '../../../../core/store/room/room.service';
import { RouteHelpers } from '../../../../core/helpers/route-helpers';
import { StatusWithAssetId } from '../../../models/status.model';
import { StatusService } from '../../../../core/services/logic/status.service';
import { AssetListType } from '../../../../shared/models/asset-list-type.model';


@Component({
  selector: 'app-assets-list-page',
  templateUrl: './assets-list-page.component.html',
  styleUrls: ['./assets-list-page.component.scss']
})
export class AssetsListPageComponent implements OnInit {

  @Input()
  type: AssetListType = AssetListType.ASSETS;

  @Input()
  factoryAssetDetailsWithFields$: Observable<FactoryAssetDetailsWithFields[]>;

  isLoading$: Observable<boolean>;
  company$: Observable<Company>;
  factorySites$: Observable<FactorySite[]>;
  rooms$: Observable<Room[]>;
  room$: Observable<Room>;
  selectedIds: Array<ID>;
  companyId: ID;
  createdAssetDetailsId: ID;
  factoryAssetStatuses$: Observable<StatusWithAssetId[]>;

  constructor(
    private factorySiteQuery: FactorySiteQuery,
    private assetQuery: AssetQuery,
    private assetService: AssetService,
    private factoryResolver: FactoryResolver,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
    private roomService: RoomService,
    private statusService: StatusService,
  ) { }

  ngOnInit() {
    this.isLoading$ = this.factorySiteQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.assetSeriesDetailsResolver.resolveFromComponent().subscribe();
    this.company$ = this.factoryResolver.company$;
    this.factorySites$ = this.factoryResolver.factorySites$;
    this.rooms$ = this.factoryResolver.rooms$;
    this.room$ = this.factoryResolver.room$;
    this.companyId = RouteHelpers.findParamInFullActivatedRoute(this.activatedRoute.snapshot, 'companyId');

    if (!this.factoryAssetDetailsWithFields$) {
      this.factoryAssetDetailsWithFields$ = this.factoryResolver.assetsWithDetailsAndFields$;
    }
    this.factoryAssetDetailsWithFields$.subscribe(() => {
      this.factoryAssetStatuses$ = this.statusService.getStatusesByAssetsWithFields(this.factoryAssetDetailsWithFields$);
    });
  }

  updateAssetData(event: [Room, FactoryAssetDetails]) {
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

  selectTheAssets(selectedAssetIds: ID[]) {
    this.selectedIds = selectedAssetIds;
  }

  toolbarClick(button: string) {
    if (button === 'GRID') {
      this.assetQuery.setSelectedAssetIds(this.selectedIds);

      const commands: string[] = this.type === AssetListType.SUBSYSTEMS ? ['../..'] : [];
      commands.push('asset-cards', this.selectedIds.join(','));

      this.router.navigate(commands, { relativeTo: this.activatedRoute });
    }
  }
}
