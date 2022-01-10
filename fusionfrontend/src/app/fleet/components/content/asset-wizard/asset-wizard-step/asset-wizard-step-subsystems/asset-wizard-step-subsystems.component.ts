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
import { Asset } from '../../../../../../core/store/asset/asset.model';
import { AssetWizardSharedSubsystemsComponent } from '../../asset-wizard-shared/asset-wizard-shared-subsystems/asset-wizard-shared-subsystems.component';
import { FleetAssetDetails } from '../../../../../../core/store/fleet-asset-details/fleet-asset-details.model';
import { ID } from '@datorama/akita';
import { FleetAssetDetailsService } from '../../../../../../core/store/fleet-asset-details/fleet-asset-details.service';

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

  public fleetAssetDetails: FleetAssetDetails[];
  public removedFleetAssetDetails: FleetAssetDetails[];
  public isReadyForNextStep = false;
  public isAddingMode = false;

  constructor(private fleetAssetDetailsService: FleetAssetDetailsService) {
    this.removedFleetAssetDetails = [];
  }

  ngOnInit(): void {
    this.fleetAssetDetailsService.getSubsystemCandidates(this.asset.companyId, this.asset.assetSeriesId)
      .subscribe(assetDetails => {
        this.fleetAssetDetails = assetDetails;
        this.removeAlreadyAddedSubsystems();
      });
  }

  private removeAlreadyAddedSubsystems() {
    const existingSubsystems = this.fleetAssetDetails.filter(candidate => this.asset.subsystemIds.includes(candidate.id));
    existingSubsystems.forEach(subsystem => {
      this.removedFleetAssetDetails.push(subsystem);
      this.fleetAssetDetails.splice(this.fleetAssetDetails.indexOf(subsystem), 1);
    });
  }

  public onBack(): void {
    if (this.isReadyForNextStep) {
      this.subsystemsChild.saveValues();
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

  public addSubsystem(fleetAssetDetails: FleetAssetDetails): void {
    this.subsystemsChild.addSubsystem(fleetAssetDetails);
    this.removedFleetAssetDetails.push(fleetAssetDetails);
    this.fleetAssetDetails.splice(this.fleetAssetDetails.indexOf(fleetAssetDetails), 1);
    this.isAddingMode = false;
  }

  public onSubsystemRemoved(subsystemId: ID): void {
    const fleetAssetDetails = this.removedFleetAssetDetails.find((item: FleetAssetDetails) => item.id === subsystemId);
    this.fleetAssetDetails.push(fleetAssetDetails);
    this.fleetAssetDetails.sort((a, b) => (a.id as number) - (b.id as number));
    this.removedFleetAssetDetails.splice(this.removedFleetAssetDetails.indexOf(fleetAssetDetails), 1);
  }
}
