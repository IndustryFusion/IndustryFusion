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
import { AbstractControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Asset } from '../../../../../../store/asset/asset.model';
import { Observable } from 'rxjs';
import { FactoryAssetDetails } from '../../../../../../store/factory-asset-details/factory-asset-details.model';
import { FleetAssetDetailsQuery } from '../../../../../../store/fleet-asset-details/fleet-asset-details.query';

@Component({
  selector: 'app-asset-wizard-shared-subsystems',
  templateUrl: './asset-wizard-shared-subsystems.component.html',
  styleUrls: ['./asset-wizard-shared-subsystems.component.scss']
})
export class AssetWizardSharedSubsystemsComponent implements OnInit {

  @Input() asset: Asset;
  @Input() isReview = false;
  @Output() changeIsValid = new EventEmitter<boolean>();
  @Output() backToEditPage = new EventEmitter<void>();

  subsystemFormArray: FormArray;
  isAddingMode = false;
  public assetDetails$: Observable<FactoryAssetDetails[]>;

  constructor(private formBuilder: FormBuilder,
              private fleetAssetDetailsQuery: FleetAssetDetailsQuery) {
  }

  ngOnInit(): void {
    this.assetDetails$ = this.fleetAssetDetailsQuery.selectAssetDetailsOfCompanyExcludingAssetSerie(this.asset.companyId,
      this.asset.assetSeriesId);

    this.subsystemFormArray = new FormArray([]);
    this.subsystemFormArray.valueChanges.subscribe(() => this.changeIsValid.emit(this.subsystemFormArray.valid));
    this.changeIsValid.emit(this.subsystemFormArray.valid);
  }

  public addSubsystem(assetDetails: FactoryAssetDetails): void {
    const subsystemGroup = this.formBuilder.group({
      id: [assetDetails.id, Validators.required],
      index: [this.subsystemFormArray.length],
      name: [assetDetails.name, Validators.required],
      assetTypeName: [assetDetails.assetTypeName, Validators.required],
      manufacturer: [assetDetails.manufacturer, Validators.required]
    });

    this.subsystemFormArray.push(subsystemGroup);
    this.isAddingMode = false;
  }

  removeSubsystem(subsystemGroup: AbstractControl): void {
    if (this.isReview) {
      this.backToEditPage.emit();
      return;
    }

    if (subsystemGroup != null) {
      const indexToRemove = subsystemGroup.get('index').value;
      this.subsystemFormArray.removeAt(indexToRemove);

      for (let i = indexToRemove; i < this.subsystemFormArray.length; i++) {
        const indexElement = this.subsystemFormArray.at(i).get('index');
        indexElement.setValue(indexElement.value - 1);
      }
    }
  }

  public onClickEdit() {
    this.backToEditPage.emit();
  }

  public startAddingMode(): void {
    this.isAddingMode = true;
  }
}
