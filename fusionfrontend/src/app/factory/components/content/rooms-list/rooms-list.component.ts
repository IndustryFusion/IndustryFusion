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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { Location } from 'src/app/store/location/location.model';
import { Asset } from 'src/app/store/asset/asset.model';
import { AssetDetails } from 'src/app/store/asset-details/asset-details.model';
import { Room } from 'src/app/store/room/room.model';
import { LocationQuery } from 'src/app/store/location/location.query';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { Location as loc } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateRoomComponent } from '../create-room/create-room.component';
import { MenuItem } from 'primeng/api';
import { AssignAssetToRoomComponent } from '../assign-asset-to-room/assign-asset-to-room.component';

@Component({
  selector: 'app-rooms-list',
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.scss'],
  providers: [DialogService]
})
export class RoomsListComponent implements OnInit {

  @Input()
  locations: Location[];
  @Input()
  rooms: Room[];
  @Input()
  locationSelected: boolean;
  @Input()
  assets: AssetDetails[];

  @Output()
  createRoomEvent = new EventEmitter<Room>();
  @Output()
  editRoomEvent = new EventEmitter<Room>();
  @Output()
  deleteRoomEvent = new EventEmitter<Room>();
  @Output()
  assignAssetToRoomEvent = new EventEmitter<Asset[]>();

  isLoading$: Observable<boolean>;
  assets$: Observable<Asset[]>;
  rooms$: Observable<Room[]>;

  companyId: ID;
  locationId: ID;

  ref: DynamicDialogRef;
  roomForm: FormGroup;
  menuActions: MenuItem[];

  activeListItem: Room;
  locationsAndRoomsMap = new Map();
  route: string;

  roomMapping:
    { [k: string]: string } = { '=0': 'No room', '=1': '# Room', other: '# Rooms' };

  constructor(private locationQuery: LocationQuery,
              private companyQuery: CompanyQuery,
              private routingLocation: loc,
              private formBuilder: FormBuilder,
              public dialogService: DialogService) { }

  ngOnInit() {
    this.route = this.routingLocation.path();
    this.isLoading$ = this.companyQuery.selectLoading();
    this.companyId = this.companyQuery.getActiveId();
    this.locationId = this.locationQuery.getActiveId();

    this.rooms.forEach(room => {
      this.locationsAndRoomsMap.set(room.id, this.locations.find(location => location.id === room.locationId).name);
    });

    this.createRoomForm(this.formBuilder);
    this.menuActions = [
      { label: 'Edit item', icon: 'pi pi-fw pi-pencil', command: (_) => { this.showEditDialog(); } },
      { label: 'Assign Asset to room', icon: 'pi pw-fw pi-sign-in', command: (_) => { this.showAssignAssetToRoomModal(); } },
      { label: 'Delete', icon: 'pi pw-fw pi-trash', command: (_) => { this.onDeleteClick(); } },
    ];
  }

  setActiveRow(room?) {
    this.activeListItem = room;
  }

  showCreateDialog() {
    this.createRoomForm(this.formBuilder);
    const ref = this.dialogService.open(CreateRoomComponent, {
      data: {
        roomForm: this.roomForm,
        locations: this.locations,
        rooms: this.rooms,
        locationSelected: this.locationSelected,
        editMode: false,
      },
      header: 'Add new room to factory',
      contentStyle: { 'padding-top': '1.5%' }
    });

    ref.onClose.subscribe((room: Room) => {
      this.createRoomEvent.emit(room);
      this.locationsAndRoomsMap.set(room.id, this.locations.find(location => location.id === room.locationId).name);
    });
  }

  showEditDialog() {
    this.createRoomForm(this.formBuilder, this.activeListItem);
    const ref = this.dialogService.open(CreateRoomComponent, {
      data: {
        roomForm: this.roomForm,
        locations: this.locations,
        rooms: this.rooms,
        locationSelected: this.locationSelected,
        editMode: true,
      },
      header: 'Edit room',
      contentStyle: { 'padding-top': '1.5%' }
    });

    ref.onClose.subscribe((room: Room) => {
      this.locationsAndRoomsMap.set(room.id, this.locations.find(location => location.id === room.locationId).name);
      this.editRoomEvent.emit(room);
    });
  }

  createRoomForm(formBuilder: FormBuilder, room?: Room) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.roomForm = formBuilder.group({
      id: [null],
      description: ['', requiredTextValidator],
      name: ['', requiredTextValidator],
      locationId: [this.locationId ? this.locationId : '', requiredTextValidator],
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
        assets: this.assets,
        locations: this.locations,
        locationsAndRoomsMap: this.locationsAndRoomsMap,
        room: this.activeListItem,
        rooms: this.rooms,
      },
      header: 'Assign Asset to Room',
    });

    ref.onClose.subscribe((assets: Asset[]) => {
      this.assignAssetToRoomEvent.emit(assets);
    });
  }

  getRoomAssetLink(roomId: ID) {
    return [roomId];
  }

  goBack() {
    this.routingLocation.back();
  }
}

