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
import { Room } from 'src/app/core/store/room/room.model';
import {
  FactoryAssetDetails,
  FactoryAssetDetailsWithFields
} from '../../../../core/store/factory-asset-details/factory-asset-details.model';
import { ID } from '@datorama/akita';
import { AssetService } from 'src/app/core/store/asset/asset.service';
import { AssetSeriesDetailsResolver } from 'src/app/core/resolvers/asset-series-details.resolver';
import { RoomService } from '../../../../core/store/room/room.service';
import { StatusWithAssetId } from '../../../models/status.model';
import { StatusService } from '../../../../core/services/logic/status.service';
import { AssetListType } from '../../../../shared/models/asset-list-type.model';
import { FieldsResolver } from '../../../../core/resolvers/fields-resolver';
import { Field } from '../../../../core/store/field/field.model';
import { FieldQuery } from '../../../../core/store/field/field.query';


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
  company$: Observable<Company>;
  factorySites$: Observable<FactorySite[]>;
  rooms$: Observable<Room[]>;
  room$: Observable<Room>;
  fields$: Observable<Field[]>;
  factoryAssetStatuses$: Observable<StatusWithAssetId[]>;

  private selectedIds: Array<ID>;
  private createdAssetDetailsId: ID;

  constructor(
    private assetQuery: AssetQuery,
    private assetService: AssetService,
    private factoryResolver: FactoryResolver,
    private fieldsResolver: FieldsResolver,
    private fieldQuery: FieldQuery,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private assetSeriesDetailsResolver: AssetSeriesDetailsResolver,
    private roomService: RoomService,
    private statusService: StatusService,
  ) { }

  ngOnInit() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.assetSeriesDetailsResolver.resolveFromComponent().subscribe();
    this.company$ = this.factoryResolver.company$;
    this.factorySites$ = this.factoryResolver.factorySites$;
    this.rooms$ = this.factoryResolver.rooms$;
    this.room$ = this.factoryResolver.room$;

    if (!this.factoryAssetDetailsWithFields$) {
      this.factoryAssetDetailsWithFields$ = this.factoryResolver.assetsWithDetailsAndFields$;
    }
    this.factoryAssetDetailsWithFields$.subscribe(() => {
      this.factoryAssetStatuses$ = this.statusService.getStatusesByAssetsWithFields(this.factoryAssetDetailsWithFields$);
    });
    this.fieldsResolver.resolve().subscribe();
    this.fields$ = this.fieldQuery.selectAll();
  }

  updateAssetData(event: [Room, FactoryAssetDetails]): void {
    const oldRoom: Room = event[0];
    const assetDetails: FactoryAssetDetails = event[1];

    assetDetails.id = assetDetails.id ? assetDetails.id : this.createdAssetDetailsId;
    this.assetService.editFactoryAsset(assetDetails.companyId, assetDetails).subscribe(
      () => {
        if (oldRoom.id !== assetDetails.roomId) {
          this.roomService.updateRoomsAfterEditAsset(oldRoom.id, assetDetails);
        }
      },
      error => console.error(error)
    );
  }

  selectAssets(selectedAssetIds: ID[]): void {
    this.selectedIds = selectedAssetIds;
  }

  toolbarClick(button: string): void {
    if (button === 'GRID') {
      this.assetQuery.setSelectedAssetIds(this.selectedIds);

      const commands: string[] = this.type === AssetListType.SUBSYSTEMS ? ['../..'] : [];
      commands.push('asset-cards', this.selectedIds.join(','));

      this.router.navigate(commands, { relativeTo: this.activatedRoute });
    }
  }
}
