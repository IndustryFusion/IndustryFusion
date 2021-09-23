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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { Asset } from 'src/app/store/asset/asset.model';
import { FactoryAssetDetails } from 'src/app/store/factory-asset-details/factory-asset-details.model';
import { Room } from 'src/app/store/room/room.model';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { Location } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomDialogComponent } from '../room-dialog/room-dialog.component';
import { MenuItem } from 'primeng/api';
import { AssignAssetToRoomComponent } from '../assign-asset-to-room/assign-asset-to-room.component';
import { FactoryResolver } from '../../../services/factory-resolver.service';
import { ActivatedRoute } from '@angular/router';
import { FactorySiteQuery } from '../../../../store/factory-site/factory-site.query';

@Component({
  selector: 'app-rooms-list',
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.scss'],
  providers: [DialogService]
})
export class RoomsListComponent implements OnInit, OnChanges {

  @Input()
  factorySites: FactorySite[];
  @Input()
  rooms: Room[];
  @Input()
  factorySiteSelected: boolean;
  @Input()
  factoryAssets: FactoryAssetDetails[];

  @Output()
  createRoomEvent = new EventEmitter<Room>();
  @Output()
  editRoomEvent = new EventEmitter<Room>();
  @Output()
  deleteRoomEvent = new EventEmitter<Room>();
  @Output()
  assignAssetToRoomEvent = new EventEmitter<[ID[], Asset[]]>();

  isLoading$: Observable<boolean>;

  factorySiteId: ID;
  factorySite$: Observable<FactorySite>;

  ref: DynamicDialogRef;
  roomForm: FormGroup;
  menuActions: MenuItem[];

  activeListItem: Room;
  factorySitesAndRoomsMap = new Map();
  oldRoomIds: ID[] = [];

  roomMapping:
    { [k: string]: string } = { '=0': 'No room', '=1': '# Room', other: '# Rooms' };

  constructor(private companyQuery: CompanyQuery,
              private routingLocation: Location,
              private formBuilder: FormBuilder,
              public dialogService: DialogService,
              public factoryResolver: FactoryResolver,
              private factorySiteQuery: FactorySiteQuery,
              public route: ActivatedRoute) {
    this.factoryResolver.resolve(route);
    this.factorySiteId = this.factorySiteQuery.getActiveId();
    this.factorySite$ = this.factoryResolver.factorySite$;
  }

  ngOnInit() {
    this.isLoading$ = this.companyQuery.selectLoading();

    this.createRoomForm(this.formBuilder);
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
        this.createRoomEvent.emit(room);
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
        this.editRoomEvent.emit(room);
      }
    });
  }

  createRoomForm(formBuilder: FormBuilder, room?: Room) {
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

  onDeleteClick() {
    this.deleteRoomEvent.emit(this.activeListItem);
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
        this.assignAssetToRoomEvent.emit([this.oldRoomIds, assets]);
        this.oldRoomIds = [];
      }
    });
  }

  getRoomAssetLink(roomId: ID) {
    return [roomId];
  }

  goBack() {
    this.routingLocation.back();
  }
}
