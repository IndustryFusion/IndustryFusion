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
import { Room } from '../../../../../store/room/room.model';
import { AssetModalMode } from '../../../../../store/factory-asset-details/factory-asset-details.model';

@Component({
  selector: 'app-asset-instantiation-room-assignment-modal',
  templateUrl: './asset-instantiation-room-assignment-modal.component.html',
  styleUrls: ['./asset-instantiation-room-assignment-modal.component.scss']
})
export class AssetInstantiationRoomAssignmentModalComponent implements OnInit {

  @Input()
  rooms: Room[];
  @Input()
  selectedRoom: Room;
  @Input()
  activeModalMode: AssetModalMode;
  @Output()
  roomAssignedEvent = new EventEmitter<Room>();

  searchText;
  filteredRooms: Room[];
  assetModalModes = AssetModalMode;

  constructor() { }

  ngOnInit(): void {
    this.filteredRooms = this.rooms;
  }

  filterRooms() {
    this.filteredRooms = this.rooms.filter(room => room.name.toLowerCase()
      .includes(this.searchText.toLowerCase()));
  }

  onSubmit() {
    this.roomAssignedEvent.emit(this.selectedRoom);
  }

  onCancel() {
    this.roomAssignedEvent.emit(null);
  }
}
