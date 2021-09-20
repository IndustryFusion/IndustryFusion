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

import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { Asset } from 'src/app/store/asset/asset.model';
import { FactoryAssetDetails } from 'src/app/store/factory-asset-details/factory-asset-details.model';
import { Room } from 'src/app/store/room/room.model';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomDialogComponent } from '../room-dialog/room-dialog.component';
import { MenuItem } from 'primeng/api';
import { AssignAssetToRoomComponent } from '../assign-asset-to-room/assign-asset-to-room.component';
import { FactoryResolver } from '../../../services/factory-resolver.service';
import { ActivatedRoute } from '@angular/router';
import { FactorySiteQuery } from '../../../../store/factory-site/factory-site.query';
import { RoomService } from '../../../../store/room/room.service';
import { FactoryAssetDetailsService } from '../../../../store/factory-asset-details/factory-asset-details.service';
import { AssetService } from '../../../../store/asset/asset.service';
import { RoomQuery } from '../../../../store/room/room.query';

@Component({
  selector: 'app-rooms-list',
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.scss'],
  providers: [DialogService]
})
export class RoomsListComponent implements OnInit, OnChanges {

  companyId: ID;
  factorySites$: Observable<FactorySite[]>;
  factorySites: FactorySite[];
  factorySiteSelected: boolean;
  factoryAssetsDetails$: Observable<FactoryAssetDetails[]>;
  factoryAssets: FactoryAssetDetails[];

  isLoading$: Observable<boolean>;
  factorySiteId: ID;
  factorySite$: Observable<FactorySite>;

  ref: DynamicDialogRef;
  roomForm: FormGroup;
  menuActions: MenuItem[];

  rooms$: Observable<Room[]>;
  rooms: Room[];
  activeListItem: Room;
  factorySitesAndRoomsMap = new Map();
  oldRoomIds: ID[] = [];

  roomMapping:
    { [k: string]: string } = { '=0': 'No room', '=1': '# Room', other: '# Rooms' };

  constructor(private companyQuery: CompanyQuery,
              private roomService: RoomService,
              private assetDetailsService: FactoryAssetDetailsService,
              private formBuilder: FormBuilder,
              public dialogService: DialogService,
              public factoryResolver: FactoryResolver,
              private factorySiteQuery: FactorySiteQuery,
              activatedRoute: ActivatedRoute,
              private assetService: AssetService,
              private roomQuery: RoomQuery) {
    this.factoryResolver.resolve(activatedRoute);
    this.factorySiteId = this.factorySiteQuery.getActiveId();
    this.factorySite$ = this.factoryResolver.factorySite$;
  }

  ngOnInit() {
    this.isLoading$ = this.companyQuery.selectLoading();

    this.createRoomForm(this.formBuilder);
    this.initMenuActions();
    this.initObservers();
  }

  private initMenuActions() {
    this.menuActions = [
      {
        label: 'Edit item', icon: 'pi pi-fw pi-pencil', command: (_) => {
          this.showEditDialog();
        }
      },
      {
        label: 'Assign Asset to room', icon: 'pi pw-fw pi-sign-in', command: (_) => {
          this.showAssignAssetToRoomModal();
        }
      },
      {
        label: 'Delete', icon: 'pi pw-fw pi-trash', command: (_) => {
          this.onDeleteClick();
        }
      },
    ];
  }

  private initObservers() {
    this.factorySites$ = this.factoryResolver.factorySites$;
    this.factorySites$.subscribe(factorySites => factorySites);
    this.factoryAssetsDetails$ = this.factoryResolver.assetsWithDetailsAndFields$;
    this.factoryAssetsDetails$.subscribe(assets => this.factoryAssets = assets);

    this.companyId = this.companyQuery.getActiveId();
    this.factorySiteId = this.factorySiteQuery.getActiveId();
    if (this.factorySiteId) {
      this.factorySiteSelected = true;
      this.rooms$ = this.factoryResolver.roomsOfFactorySite$;
    } else {
      this.factorySiteSelected = false;
      this.rooms$ = this.factoryResolver.rooms$;
    }

    this.rooms$.subscribe(rooms => this.rooms = rooms);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.rooms) {
      this.rooms.forEach(room => {
        this.factorySitesAndRoomsMap.set(room.id, this.factorySites?.find(factorySite => factorySite.id === room.factorySiteId).name);
      });
    }
  }

  setActiveRow(room?) {
    this.activeListItem = room;
  }

  showCreateDialog() {
    this.createRoomForm(this.formBuilder);
    const ref = this.dialogService.open(RoomDialogComponent, {
      data: {
        roomForm: this.roomForm,
        factorySites: this.factorySites,
        rooms: this.rooms,
        factorySiteSelected: this.factorySiteSelected,
        editMode: false,
      },
      header: 'Add new room to factory',
      contentStyle: { 'padding-top': '1.5%' }
    });

    ref.onClose.subscribe((room: Room) => {
      if (room) {
        this.factorySitesAndRoomsMap.set(room.id, this.factorySites.find(factorySite => factorySite.id.toString()
          === room.factorySiteId.toString()).name);
        this.createRoom(room);
      }
    });
  }

  showEditDialog() {
    this.createRoomForm(this.formBuilder, this.activeListItem);
    const ref = this.dialogService.open(RoomDialogComponent, {
      data: {
        room: this.activeListItem,
        roomForm: this.roomForm,
        factorySites: this.factorySites,
        rooms: this.rooms,
        factorySiteSelected: this.factorySiteSelected,
        editMode: true,
      },
      header: 'Edit room',
      contentStyle: { 'padding-top': '1.5%' }
    });

    ref.onClose.subscribe((room: Room) => {
      if (room) {
        this.factorySitesAndRoomsMap.set(room.id, this.factorySites.find(factorySite => factorySite.id === room.factorySiteId).name);
        this.editRoom(room);
      }
    });
  }

  // TODO: put method in dialog
  createRoomForm(formBuilder: FormBuilder, room?: Room) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.roomForm = formBuilder.group({
      id: [null],
      description: ['', requiredTextValidator],
      name: ['', requiredTextValidator],
      factorySiteId: [this.factorySiteId ? this.factorySiteId : '', requiredTextValidator],
      assets: [[]],
      assetIds: [[]]
    });
    if (room) {
      this.roomForm.patchValue(room);
    }
  }

  onDeleteClick() {
    this.deleteRoom(this.activeListItem);
  }

  showAssignAssetToRoomModal() {
    this.createRoomForm(this.formBuilder, this.activeListItem);
    const ref = this.dialogService.open(AssignAssetToRoomComponent, {
      data: {
        roomForm: this.roomForm,
        factoryAssets: this.factoryAssets,
        factorySites: this.factorySites,
        factorySitesAndRoomsMap: this.factorySitesAndRoomsMap,
        room: this.activeListItem,
        rooms: this.rooms,
      },
      header: 'Assign Asset to Room',
    });

    ref.onClose.subscribe((assets: Asset[]) => {
      if (assets) {
        const roomId = this.activeListItem.id;
        this.oldRoomIds.push(roomId);
        assets.forEach(asset => {
          this.oldRoomIds.push(asset.roomId);
        });
        this.assignAssetsToRoom(this.oldRoomIds, assets);
        this.oldRoomIds = [];
      }
    });
  }

  getRoomAssetLink(roomId: ID) {
    return [roomId];
  }

  private deleteRoom(room: Room) {
    const factorySiteId = this.factorySiteQuery.getActiveId();
    this.roomService.deleteRoom(this.companyId, factorySiteId, room.id).subscribe();
  }

  private editRoom(room: Room) {
    if (room) {
      this.roomService.updateRoom(this.companyId, room).subscribe();
      this.assetDetailsService.updateRoomNames(room);
    }
  }

  private createRoom(room: Room) {
    if (room) {
      if (room.id) {
        this.roomService.updateRoom(this.companyId, room).subscribe();
      } else {
        this.roomService.createRoom(this.companyId, room).subscribe();
      }
    }
  }

  private assignAssetsToRoom(oldRoomIds: ID[], assets: Asset[]) {
    const room = this.roomQuery.getEntity(oldRoomIds[0]);
    const oldFactoryIdSet: Set<ID> = new Set<ID>();
    oldRoomIds.forEach(id => {
      oldFactoryIdSet.add(this.roomQuery.getEntity(id).factorySiteId);
    });
    this.assetService.assignAssetsToRoom(this.companyId, room.factorySiteId, oldRoomIds[0], assets)
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
