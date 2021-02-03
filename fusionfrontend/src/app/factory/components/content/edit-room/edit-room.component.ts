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
import { Room } from 'src/app/store/room/room.model';

@Component({
  selector: 'app-edit-room',
  templateUrl: './edit-room.component.html',
  styleUrls: ['./edit-room.component.scss']
})
export class EditRoomComponent implements OnInit {

  @Output()
  modalOpened = new EventEmitter<Room>();

  newRoomName: string;
  newRoomDescription: string;

  @Input()
  activeRoom: Room;


  constructor() { }

  ngOnInit() {
  }

  updateRoom() {
    const updatedRoom = Object.assign({ }, this.activeRoom);
    updatedRoom.name = this.newRoomName;
    updatedRoom.description = this.newRoomDescription;

    this.modalOpened.emit(updatedRoom);
    this.newRoomName = null;
    this.newRoomDescription = null;
  }

  cancel() {
    this.modalOpened.emit(null);
  }
}
