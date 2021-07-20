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

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AssetWizardStep } from '../asset-wizard-step.model';
import { Asset } from '../../../../../../store/asset/asset.model';
import { AssetWizardSharedSubsystemsComponent } from '../../asset-wizard-shared/asset-wizard-shared-subsystems/asset-wizard-shared-subsystems.component';
import { FactoryAssetDetails } from '../../../../../../store/factory-asset-details/factory-asset-details.model';
import { FleetAssetDetailsQuery } from '../../../../../../store/fleet-asset-details/fleet-asset-details.query';
import { Observable } from 'rxjs';
import { FleetAssetDetails } from '../../../../../../store/fleet-asset-details/fleet-asset-details.model';

@Component({
  selector: 'app-asset-wizard-step-subsystems',
  templateUrl: './asset-wizard-step-subsystems.component.html',
  styleUrls: ['./asset-wizard-step-subsystems.component.scss']
})
export class AssetWizardStepSubsystemsComponent implements OnInit {

  @ViewChild(AssetWizardSharedSubsystemsComponent) subsystemsChild: AssetWizardSharedSubsystemsComponent;

  @Input() asset: Asset;
  @Output() valid = new EventEmitter<boolean>();
  @Output() stepChange = new EventEmitter<number>();

  public assetDetails$: Observable<FactoryAssetDetails[]>;
  public isReadyForNextStep = false;
  public isAddingMode = false;

  constructor(private fleetAssetDetailsQuery: FleetAssetDetailsQuery) {
  }

  ngOnInit(): void {
    this.assetDetails$ = this.fleetAssetDetailsQuery.selectAssetDetailsOfCompanyExcludingAssetSerie(this.asset.companyId,
      this.asset.assetSeriesId);
  }

  public onBack(): void {
    if (this.isReadyForNextStep) {
      this.stepChange.emit(AssetWizardStep.SUBSYSTEMS - 1);
    }
  }

  public onNext(): void {
    if (this.isReadyForNextStep) {
      this.subsystemsChild.saveValues();
      this.stepChange.emit(AssetWizardStep.SUBSYSTEMS + 1);
    }
  }

  public onSetValid(isValid: boolean): void {
    this.isReadyForNextStep = isValid;
    this.valid.emit(isValid);
  }

  public startAddingMode(): void {
    this.isAddingMode = true;
  }

  public addSubsystem(assetDetails: FleetAssetDetails): void {
    this.subsystemsChild.addSubsystem(assetDetails);
    this.isAddingMode = false;
  }
}
