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
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-asset-instantiation-paired-modal',
  templateUrl: './asset-instantiation-paired-modal.component.html',
  styleUrls: ['./asset-instantiation-paired-modal.component.scss']
})
export class AssetInstantiationPairedModalComponent implements OnInit {

  @Input()
  assetDetailsForm: FormGroup;
  @Output()
  assetPairedEvent = new EventEmitter<boolean>();
  pairingProcess = true;


  constructor() { }

  ngOnInit(): void {
    setTimeout(() => this.pairingProcess = false, 1000);
  }

  onSubmit(event: boolean) {
    this.assetPairedEvent.emit(event);
  }

}
