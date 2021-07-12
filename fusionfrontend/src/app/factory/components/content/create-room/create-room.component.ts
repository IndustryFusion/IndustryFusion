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

import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { Room } from 'src/app/store/room/room.model';
// import { RoomService } from 'src/app/store/room/room.service';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { Company } from 'src/app/store/company/company.model';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss']
})
export class CreateRoomComponent implements OnInit {
  @Input()
  factorySite: FactorySite;
  @Input()
  company: Company;

  newRoomName: string;
  newRoomDescription: string;
  private room: Room = new Room();
  @Output()
  modalOpened = new EventEmitter<Room>();

  constructor() { }

  ngOnInit() {
  }

  createRoom() {
    this.room.name = this.newRoomName;
    this.room.description = this.newRoomDescription;
    this.room.factorySiteId = this.factorySite.id;
    this.modalOpened.emit(this.room);
    this.newRoomName = null;
    this.newRoomDescription = null;
  }

  cancel() {
    this.modalOpened.emit(null);
  }
}
