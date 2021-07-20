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
import { AbstractControl, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Asset } from '../../../../../../store/asset/asset.model';
import { AssetQuery } from '../../../../../../store/asset/asset.query';
import { FleetAssetDetails } from '../../../../../../store/fleet-asset-details/fleet-asset-details.model';
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

  constructor(private formBuilder: FormBuilder,
              private fleetAssetDetailsQuery: FleetAssetDetailsQuery,
              private assetQuery: AssetQuery) {
  }

  ngOnInit(): void {
    if (!this.asset.subsystems) {
      this.asset.subsystems = new Array<Asset>();
    }
    this.fillTable(this.asset.subsystems);
  }

  private fillTable(subsystems: Asset[]) {
    this.subsystemFormArray = new FormArray([]);
    this.subsystemFormArray.valueChanges.subscribe(() => this.changeIsValid.emit(this.subsystemFormArray.valid));
    this.changeIsValid.emit(this.subsystemFormArray.valid);

    for (const subsystem of subsystems) {
      const assetDetails: FleetAssetDetails = this.fleetAssetDetailsQuery.getEntity(subsystem.id);
      this.addSubsystem(assetDetails);
    }
    this.changeIsValid.emit(this.subsystemFormArray.valid);
  }

  public addSubsystem(assetDetails: FleetAssetDetails): void {
    const subsystemGroup = this.formBuilder.group({
      id: [assetDetails.id, Validators.required],
      index: [this.subsystemFormArray.length],
      name: [assetDetails.name, Validators.required],
      assetTypeName: [assetDetails.assetTypeName, Validators.required],
      manufacturer: [assetDetails.manufacturer, Validators.required]
    });

    this.subsystemFormArray.push(subsystemGroup);
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

  private getSubsystemFromForm(subsystemGroup: FormControl): Asset {
    return this.assetQuery.getEntity(subsystemGroup.get('id').value);
  }

  public saveValues() {
    if (this.subsystemFormArray.valid) {
       this.asset.subsystems = new Array<Asset>();
       this.subsystemFormArray.controls.forEach((subsystemGroup: FormControl) => {
         this.asset.subsystems.push(this.getSubsystemFromForm(subsystemGroup));
       });
    }
  }

  public onClickEdit() {
    this.backToEditPage.emit();
  }
}
