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
import { Room } from 'src/app/core/store/room/room.model';
import { FactorySite } from 'src/app/core/store/factory-site/factory-site.model';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-room-dialog',
  templateUrl: './room-dialog.component.html',
  styleUrls: ['./room-dialog.component.scss']
})
export class RoomDialogComponent implements OnInit {

  roomForm: FormGroup;
  rooms: Room[];
  factorySites: FactorySite[];
  factorySiteSelected: boolean;
  editMode: boolean;
  room: Room;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig) {
  }

  ngOnInit() {
    this.room = this.config.data.room ? { ...this.config.data.room } : new Room();
    this.roomForm = this.config.data.roomForm;
    this.rooms = this.config.data.rooms;
    this.factorySites = this.config.data.factorySites;
    this.factorySiteSelected = this.config.data.factorySiteSelected;
    this.editMode = this.config.data.editMode;

    this.validateConfigData();
  }

  private validateConfigData() {
    if (!this.roomForm) {
      console.warn('[room dialog]: Form is missing');
    }
    if (!this.rooms) {
      console.warn('[room dialog]: Rooms are missing');
    }
    if (!this.factorySites) {
      console.warn('[room dialog]: Factory sites are missing');
    }
  }

  onCancel() {
    this.ref.close();
  }

  onSubmit() {
    this.updateRoomData();
    this.ref.close(this.room);
  }

  updateRoomData() {
    this.room.description = this.roomForm.get('description').value;
    this.room.name = this.roomForm.get('name').value;
    this.room.factorySiteId = this.roomForm.get('factorySiteId').value;
  }
}
