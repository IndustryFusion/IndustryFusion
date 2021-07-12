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
import { FactorySite } from '../../../../../store/factory-site/factory-site.model';
import { AssetModalMode } from '../../../../../store/asset-details/asset-details.model';

@Component({
  selector: 'app-asset-instantiation-factory-site-assignment-modal',
  templateUrl: './asset-instantiation-factory-site-assignment-modal.component.html',
  styleUrls: ['./asset-instantiation-factory-site-assignment-modal.component.scss']
})
export class AssetInstantiationFactorySiteAssignmentModalComponent implements OnInit {

  @Input()
  factorySites: FactorySite[];
  @Input()
  selectedFactorySite: FactorySite;
  @Input()
  activeModalMode: AssetModalMode;
  @Output()
  factorySitesAssignedEvent = new EventEmitter<FactorySite>();

  searchText: string;
  filteredFactorySite: FactorySite[];
  assetModalModes = AssetModalMode;

  constructor() { }

  ngOnInit(): void {
    this.filteredFactorySite = this.factorySites;
  }

  filterFactorySites() {
    this.filteredFactorySite = this.factorySites.filter(factorySite => factorySite.name.toLowerCase()
      .includes(this.searchText.toLowerCase()));
  }

  onSubmit() {
    this.factorySitesAssignedEvent.emit(this.selectedFactorySite);

  }

  onBackButtonPressed() {
    this.factorySitesAssignedEvent.emit(null);
  }
}
