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

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Room } from '../../../../../store/room/room.model';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-asset-instantiation-room-assignment-modal',
  templateUrl: './asset-instantiation-room-assignment-modal.component.html',
  styleUrls: ['./asset-instantiation-room-assignment-modal.component.scss']
})
export class AssetInstantiationRoomAssignmentModalComponent implements OnInit {

  @Input()
  rooms: Room[];

  @Input()
  assetDetailsForm: FormGroup;

  @Output()
  closedRoomAssignmentModalEvent = new EventEmitter<[boolean, Room]>();

  @Output()
  stoppedAssetAssignment = new EventEmitter<boolean>();

  selectedRoom: Room;
  noSpecificRoom = 'NoSpecificRoom';
  roomControlValidation = 'roomName';

  constructor() { }

  ngOnInit(): void {
  }

  radioChecked(room?: Room) {
    this.selectedRoom = room;
  }

  clickedFinish(event: boolean) {
    if (event) {
      if (this.assetDetailsForm.controls[this.roomControlValidation].valid) {
        this.closedRoomAssignmentModalEvent.emit([event, this.selectedRoom]);
      }
    } else {
      this.closedRoomAssignmentModalEvent.emit([event, null]);
    }
  }

  closeModal(event: boolean) {
    if (event) {
      this.stoppedAssetAssignment.emit(event);
    }
  }
}
