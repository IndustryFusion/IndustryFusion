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
import { Asset } from '../../../../../../core/store/asset/asset.model';
import { FleetAssetDetails } from '../../../../../../core/store/fleet-asset-details/fleet-asset-details.model';
import { FleetAssetDetailsQuery } from '../../../../../../core/store/fleet-asset-details/fleet-asset-details.query';
import { ID } from '@datorama/akita';
import { WizardHelper } from '../../../../../../core/helpers/wizard-helper';

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
  @Output() subsystemRemoved = new EventEmitter<ID>();

  subsystemFormArray: FormArray;

  constructor(private formBuilder: FormBuilder,
              private fleetAssetDetailsQuery: FleetAssetDetailsQuery) {
  }

  ngOnInit(): void {
    if (!this.asset.subsystemIds) {
      this.asset.subsystemIds = new Array<ID>();
    }
    this.fillTable(this.asset.subsystemIds);
  }

  private fillTable(subsystemIds: ID[]): void {
    this.subsystemFormArray = new FormArray([]);
    this.subsystemFormArray.valueChanges.subscribe(() => this.changeIsValid.emit(this.subsystemFormArray.valid));
    this.changeIsValid.emit(this.subsystemFormArray.valid);

    for (const subsystemId of subsystemIds) {
      const assetDetails: FleetAssetDetails = this.fleetAssetDetailsQuery.getEntity(subsystemId);
      this.addSubsystem(assetDetails);
    }
    this.changeIsValid.emit(this.subsystemFormArray.valid);
  }

  public addSubsystem(assetDetails: FleetAssetDetails): void {
    const subsystemGroup = this.formBuilder.group({
      id: [],
      version: [],
      index: [this.subsystemFormArray.length],
      name: [null, Validators.required],
      assetTypeName: [null, Validators.required],
      manufacturer: [null, Validators.required],
      imageKey: []
    });

    subsystemGroup.patchValue(assetDetails);
    this.subsystemFormArray.push(subsystemGroup);
  }

  public removeSubsystem(subsystemGroup: AbstractControl): void {
    if (this.isReview) {
      this.backToEditPage.emit();
      return;
    }

    if (subsystemGroup != null) {
        const removedSubsystemId = WizardHelper.removeSubsystemFromFormArray(subsystemGroup, this.subsystemFormArray);
        this.subsystemRemoved.emit(removedSubsystemId);
    }
  }

  public saveValues(): void {
    if (this.subsystemFormArray.valid) {
       this.asset.subsystemIds = new Array<ID>();
       this.subsystemFormArray.controls.forEach((subsystemGroup: FormControl) => {
         this.asset.subsystemIds.push(subsystemGroup.get('id').value);
       });
    }
  }

  public onClickEdit(): void {
    this.backToEditPage.emit();
  }
}
