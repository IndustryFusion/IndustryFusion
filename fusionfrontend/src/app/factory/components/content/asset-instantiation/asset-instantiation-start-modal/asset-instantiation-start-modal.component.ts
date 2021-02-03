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
  selector: 'app-asset-instantiation-start-modal',
  templateUrl: './asset-instantiation-start-modal.component.html',
  styleUrls: ['./asset-instantiation-start-modal.component.scss']
})
export class AssetInstantiationStartModalComponent implements OnInit {

  @Input()
  assetSeries: AssetSeriesDetails[];

  @Output()
  clickedStartEvent = new EventEmitter<AssetSeriesDetails>();

  @Output()
  stoppedAssetAssignment = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  emitStartInstantiationEvent(assetSerie?: AssetSeriesDetails) {
    this.clickedStartEvent.emit(assetSerie);
  }

  closeModal(event: boolean) {
    if (event) {
      this.stoppedAssetAssignment.emit(event)
    }
  }
}
