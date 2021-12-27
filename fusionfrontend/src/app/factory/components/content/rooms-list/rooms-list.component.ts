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
import { FactorySite } from 'src/app/core/store/factory-site/factory-site.model';
import { Asset } from 'src/app/core/store/asset/asset.model';
import { FactoryAssetDetails } from 'src/app/core/store/factory-asset-details/factory-asset-details.model';
import { Room } from 'src/app/core/store/room/room.model';
import { CompanyQuery } from 'src/app/core/store/company/company.query';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomDialogComponent } from '../room-dialog/room-dialog.component';
import { ConfirmationService } from 'primeng/api';
import { AssignAssetToRoomComponent } from '../assign-asset-to-room/assign-asset-to-room.component';
import { FactoryResolver } from '../../../services/factory-resolver.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FactorySiteQuery } from '../../../../core/store/factory-site/factory-site.query';
import { RoomService } from '../../../../core/store/room/room.service';
import { FactoryAssetDetailsService } from '../../../../core/store/factory-asset-details/factory-asset-details.service';
import { AssetService } from '../../../../core/store/asset/asset.service';
import { RoomQuery } from '../../../../core/store/room/room.query';
import { ItemOptionsMenuType } from 'src/app/shared/components/ui/item-options-menu/item-options-menu.type';
import { TableHelper } from '../../../../core/helpers/table-helper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-rooms-list',
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class RoomsListComponent implements OnInit {

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

  rooms$: Observable<Room[]>;
  rooms: Room[];
  activeListItem: Room;
  factorySitesAndRoomsMap = new Map();
  oldRoomIds: ID[] = [];

  roomMapping:
    { [k: string]: string } = { '=0': this.translate.instant('APP.FACTORY.ROOMS_LIST.NO_ROOM'), '=1': '# ' +
      this.translate.instant('APP.COMMON.TERMS.ROOM'), other: '# ' + this.translate.instant('APP.COMMON.TERMS.ROOMS') };

  rowsPerPageOptions: number[] = TableHelper.rowsPerPageOptions;
  rowCount = TableHelper.defaultRowCount;

  ItemOptionsMenuType = ItemOptionsMenuType;

  constructor(private companyQuery: CompanyQuery,
              private roomService: RoomService,
              private assetDetailsService: FactoryAssetDetailsService,
              private formBuilder: FormBuilder,
              private dialogService: DialogService,
              private factoryResolver: FactoryResolver,
              private factorySiteQuery: FactorySiteQuery,
              private assetService: AssetService,
              private roomQuery: RoomQuery,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private confirmationService: ConfirmationService,
              public translate: TranslateService) {
    this.factoryResolver.resolve(this.activatedRoute);
    this.factorySiteId = this.factorySiteQuery.getActiveId();
    this.factorySite$ = this.factoryResolver.factorySite$;
  }

  ngOnInit() {
    this.isLoading$ = this.companyQuery.selectLoading();

    this.createRoomForm(this.formBuilder);
    this.initObservers();

    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.activatedRoute.snapshot, this.router);
  }

  private initObservers() {
    this.factorySites$ = this.factoryResolver.factorySites$;
    this.factorySites$.subscribe(factorySites => {
      this.factorySites = factorySites;
      this.initFactorySitesAndRoomsMap();
    });
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

    this.rooms$.subscribe(rooms =>  {
      this.rooms = this.addFactorySideToRooms(rooms);
      this.initFactorySitesAndRoomsMap();
    });
  }

  addFactorySideToRooms(rooms: Room[]): Room[] {
    if (this.rooms$ && this.factorySites) {
      const roomsWithFactorySite: Room[] = [];
      rooms.forEach((room, index) =>  {
        roomsWithFactorySite.push({ ...room });
        roomsWithFactorySite[index].factorySite = this.factorySites.find(factorySite => factorySite.id === room.factorySiteId);
      });
      return this.sortRoomsByFactorySiteByDefault(roomsWithFactorySite);
    }
  }

  sortRoomsByFactorySiteByDefault(rooms: Room[]): Room[] {
    return rooms.sort((a, b) => {
      if (a.factorySite.name > b.factorySite.name) {
        return 1;
      } else if (a.factorySite.name < b.factorySite.name) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  private initFactorySitesAndRoomsMap() {
    if (this.rooms && this.factorySites) {
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
      header: this.translate.instant('APP.FACTORY.ROOMS_LIST.DIALOG_HEADER.ADD_NEW_ROOM'),
      contentStyle: { 'padding-top': '1.5%' }
    });

    ref.onClose.subscribe((room: Room) => {
      if (room) {
        this.factorySitesAndRoomsMap.set(room.id, this.factorySites.find(factorySite => factorySite.id.toString()
          === room.factorySiteId.toString()).name);
        this.createOrUpdateRoom(room);
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
      header: this.translate.instant('APP.FACTORY.ROOMS_LIST.DIALOG_HEADER.EDIT_ROOM'),
      contentStyle: { 'padding-top': '1.5%' }
    });

    ref.onClose.subscribe((room: Room) => {
      if (room) {
        this.factorySitesAndRoomsMap.set(room.id, this.factorySites.find(factorySite => factorySite.id === room.factorySiteId).name);
        this.editRoom(room);
      }
    });
  }

  // TODO: put method in dialog [IF-429]
  private createRoomForm(formBuilder: FormBuilder, room?: Room) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.roomForm = formBuilder.group({
      id: [null],
      version: [],
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
      header: this.translate.instant('APP.FACTORY.ROOMS_LIST.DIALOG_HEADER.ASSIGN_ASSET')
    });

    ref.onClose.subscribe((assets: Asset[]) => {
      if (assets) {
        const newRoomId = this.activeListItem.id;
        assets.forEach(asset => {
          this.oldRoomIds.push(asset.roomId);
        });
        this.assignAssetsToRoom(newRoomId, this.oldRoomIds, assets);
        this.oldRoomIds = [];
      }
    });
  }

  getRoomAssetLink(roomId: ID) {
    return this.factorySiteSelected ? ['../..', 'rooms', roomId] : [roomId];
  }

  private editRoom(room: Room) {
    if (room) {
      this.roomService.updateRoom(this.companyId, room).subscribe();
      this.assetDetailsService.updateRoomNames(room);
    }
  }

  private createOrUpdateRoom(room: Room) {
    if (room) {
      if (room.id) {
        this.roomService.updateRoom(this.companyId, room).subscribe();
      } else {
        this.roomService.createRoom(this.companyId, room).subscribe();
      }
    }
  }

  private assignAssetsToRoom(newRoomId: ID, oldRoomIds: ID[], assets: Asset[]) {
    const newRoom = this.roomQuery.getEntity(newRoomId);
    const oldFactoryIdSet: Set<ID> = new Set<ID>();
    oldRoomIds.forEach(id => {
      oldFactoryIdSet.add(this.roomQuery.getEntity(id).factorySiteId);
    });

    this.assetService.assignAssetsToRoom(this.companyId, newRoom.factorySiteId, newRoom.id, assets)
      .subscribe(
        _ => {
          oldFactoryIdSet.forEach(factoryId => { // TODO (fpa): only factories of oldRooms?
            this.roomService.getRoomsOfFactorySite(this.companyId, factoryId, true).subscribe();
          });
        },
        error => {
          console.error(error);
        }
      );
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: this.translate.instant('APP.FACTORY.ROOMS_LIST.CONFIRMATION_DIALOG.MESSAGE', { itemToDelete: this.activeListItem.name}),
      header: this.translate.instant('APP.FACTORY.ROOMS_LIST.CONFIRMATION_DIALOG.HEADER'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteRoom(this.activeListItem);
      },
      reject: () => {
      }
    });
  }

  private deleteRoom(room: Room) {
    const factorySiteId = this.factorySiteQuery.getActiveId();
    this.roomService.deleteRoom(this.companyId, factorySiteId, room.id).subscribe();
  }

  updateRowCountInUrl(rowCount: number): void {
    TableHelper.updateRowCountInUrl(rowCount, this.router);
  }
}
