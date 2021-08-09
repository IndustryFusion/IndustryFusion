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
import { Location } from 'src/app/store/location/location.model';
import { Asset } from '../../../../store/asset/asset.model';
import { AssetDetails } from 'src/app/store/asset-details/asset-details.model';
import { Room } from 'src/app/store/room/room.model';
import { LocationQuery } from 'src/app/store/location/location.query';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { RoomService } from 'src/app/store/room/room.service';
import { ActivatedRoute } from '@angular/router';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { Company } from 'src/app/store/company/company.model';
import { AssetDetailsService } from '../../../../store/asset-details/asset-details.service';

@Component({
  selector: 'app-rooms-page',
  templateUrl: './rooms-page.component.html',
  styleUrls: ['./rooms-page.component.scss']
})
export class RoomsPageComponent implements OnInit {
  isLoading$: Observable<boolean>;
  company$: Observable<Company>;
  assetsDetails$: Observable<AssetDetails[]>;
  locations$: Observable<Location[]>;
  rooms$: Observable<Room[]>;

  companyId: ID;
  locationId: ID;
  locationSelected: boolean;

  constructor(private locationQuery: LocationQuery,
              private companyQuery: CompanyQuery,
              private roomService: RoomService,
              private factoryResolver: FactoryResolver,
              private activatedRoute: ActivatedRoute,
              private assetDetailsService: AssetDetailsService,
  ) { }

  ngOnInit() {
    this.isLoading$ = this.companyQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.company$ = this.factoryResolver.company$;
    this.locations$ = this.factoryResolver.locations$;
    this.assetsDetails$ = this.factoryResolver.assetsWithDetailsAndFields$;
    this.companyId = this.companyQuery.getActiveId();
    this.locationId = this.locationQuery.getActiveId();
    if (this.locationId) {
      this.locationSelected = true;
      this.rooms$ = this.factoryResolver.allRoomsOfLocation$;
    } else {
      this.locationSelected = false;
      this.rooms$ = this.factoryResolver.rooms$;
    }
  }

  deleteRoom(room: Room) {
    console.log(room);
    const companyId = this.companyQuery.getActiveId();
    const locationId = this.locationQuery.getActiveId();
    this.roomService.deleteRoom(companyId, locationId, room.id)
      .subscribe(() => {
        console.log('[rooms-page.component] Delete request successful', room.id);
      });
  }

  editRoom(event: Room) {
    if (event) {
      this.roomService.updateRoom(this.companyId, event)
        .subscribe(data => {
          console.log('[rooms-page.component] Patch request successful', data);
        });
      this.assetDetailsService.updateRoomNames(event);
    }
  }

  createRoom(event: Room) {
    if (event) {
      if (event.id)  {
        this.roomService.updateRoom(this.companyId, event)
          .subscribe(data => {
            console.log('[rooms-page.component] Put request successful', data);
          });
      } else {
        this.roomService.createRoom(this.companyId, event)
          .subscribe(data => {
            console.log('[rooms-page.component] Post request successful', data);
          });
      }
    }
  }

  assignToRoom(assets: Asset[]) {
    console.log(assets);
    // const theAsset = this.assetQuery.getEntity(asset.id);
    // this.assetService.assignAssetToRoom(this.companyId, this.locationId, this.selectedRoomId, theAsset.roomId, asset.id)
    //   .subscribe(
    //     asset => { console.log('[rooms-page.component] asset: ' + asset.name + ' assigned'); },
    //     error => { console.log(error); }
    //   );
    // this.assetDetailsService.updateRoom(asset.id, this.selectedRoomId);
  }

}
