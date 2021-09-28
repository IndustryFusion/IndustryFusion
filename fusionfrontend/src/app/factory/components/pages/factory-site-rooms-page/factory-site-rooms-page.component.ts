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

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { FactoryAssetDetails } from 'src/app/store/factory-asset-details/factory-asset-details.model';
import { Room } from 'src/app/store/room/room.model';
import { FactorySiteQuery } from 'src/app/store/factory-site/factory-site.query';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { RoomService } from 'src/app/store/room/room.service';
import { ActivatedRoute } from '@angular/router';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { Company } from 'src/app/store/company/company.model';
import { FactoryAssetDetailsService } from '../../../../store/factory-asset-details/factory-asset-details.service';
import { AssetService } from 'src/app/store/asset/asset.service';
import { RoomQuery } from '../../../../store/room/room.query';
import { Asset } from '../../../../store/asset/asset.model';

@Component({
  selector: 'app-factory-site-rooms-page',
  templateUrl: './factory-site-rooms-page.component.html',
  styleUrls: ['./factory-site-rooms-page.component.scss']
})
export class FactorySiteRoomsPageComponent implements OnInit {
  isLoading$: Observable<boolean>;
  company$: Observable<Company>;
  factoryAssetsDetails$: Observable<FactoryAssetDetails[]>;
  factorySites$: Observable<FactorySite[]>;
  rooms$: Observable<Room[]>;

  companyId: ID;
  factorySiteId: ID;
  factorySiteSelected: boolean;

  constructor(private factorySiteQuery: FactorySiteQuery,
              private companyQuery: CompanyQuery,
              private roomService: RoomService,
              private factoryResolver: FactoryResolver,
              private activatedRoute: ActivatedRoute,
              private assetDetailsService: FactoryAssetDetailsService,
              private assetService: AssetService,
              private roomQuery: RoomQuery) {
  }

  ngOnInit() {
    this.isLoading$ = this.companyQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.company$ = this.factoryResolver.company$;
    this.factorySites$ = this.factoryResolver.factorySites$;
    this.factoryAssetsDetails$ = this.factoryResolver.assetsWithDetailsAndFields$;
    this.companyId = this.companyQuery.getActiveId();
    this.factorySiteId = this.factorySiteQuery.getActiveId();
    if (this.factorySiteId) {
      this.factorySiteSelected = true;
      this.rooms$ = this.factoryResolver.roomsOfFactorySite$;
    } else {
      this.factorySiteSelected = false;
      this.rooms$ = this.factoryResolver.rooms$;
    }
  }

  deleteRoom(room: Room) {
    const companyId = this.companyQuery.getActiveId();
    const factorySiteId = this.factorySiteQuery.getActiveId();
    this.roomService.deleteRoom(companyId, factorySiteId, room.id).subscribe();
  }

  editRoom(event: Room) {
    if (event) {
      this.roomService.updateRoom(this.companyId, event).subscribe();
      this.assetDetailsService.updateRoomNames(event);
    }
  }

  createRoom(event: Room) {
    if (event) {
      if (event.id) {
        this.roomService.updateRoom(this.companyId, event).subscribe();
      } else {
        this.roomService.createRoom(this.companyId, event).subscribe();
      }
    }
  }

  assignAssetsToRoom(event: [oldRoomIds: ID[], assets: Asset[]]) {
    const room = this.roomQuery.getEntity(event[0][0]);
    const oldFactoryIdSet: Set<ID> = new Set<ID>();
    event[0].forEach(id => {
      oldFactoryIdSet.add(this.roomQuery.getEntity(id).factorySiteId);
    });
    this.assetService.assignAssetsToRoom(this.companyId, room.factorySiteId, event[0][0], event[1])
      .subscribe(
        _ => {
          oldFactoryIdSet.forEach(factoryId => {
            this.roomService.getRoomsOfFactorySite(this.companyId, factoryId, true).subscribe();
          });
        },
        error => {
          console.error(error);
        }
      );
  }
}