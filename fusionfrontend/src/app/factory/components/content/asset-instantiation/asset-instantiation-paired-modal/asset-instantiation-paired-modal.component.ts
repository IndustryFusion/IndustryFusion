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
import { AssetSeriesDetails } from '../../../../../store/asset-series-details/asset-series-details.model';

@Component({
  selector: 'app-asset-instantiation-paired-modal',
  templateUrl: './asset-instantiation-paired-modal.component.html',
  styleUrls: ['./asset-instantiation-paired-modal.component.scss']
})
export class AssetInstantiationPairedModalComponent implements OnInit {

  @Input()
  assetSeries: AssetSeriesDetails;

  @Output()
  clickedCustomizeEvent = new EventEmitter<boolean>();

  @Output()
  stoppedAssetAssignment = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  emitCustomizeEvent(event: boolean) {
    this.clickedCustomizeEvent.emit(event);
  }

  closeModal(event: boolean) {
    if (event) {
      this.stoppedAssetAssignment.emit(event)
    }
  }
}
