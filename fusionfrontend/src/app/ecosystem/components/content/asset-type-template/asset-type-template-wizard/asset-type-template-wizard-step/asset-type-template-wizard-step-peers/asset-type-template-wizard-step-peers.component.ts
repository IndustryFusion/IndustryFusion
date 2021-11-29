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
import { ID } from '@datorama/akita';
import { AssetTypeTemplate } from '../../../../../../../core/store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateService } from '../../../../../../../core/store/asset-type-template/asset-type-template.service';
import { AssetTypeTemplateWizardSteps } from '../../asset-type-template-wizard-steps.model';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { AssetTypeTemplateWizardStepStartComponent } from '../asset-type-template-wizard-step-start/asset-type-template-wizard-step-start.component';
import { AssetTypeTemplateWizardSharedRelationshipsComponent } from '../../asset-type-template-wizard-shared/asset-type-template-wizard-shared-relationship/asset-type-template-wizard-shared-relationships.component';

@Component({
  selector: 'app-asset-type-template-wizard-step-peers',
  templateUrl: './asset-type-template-wizard-step-peers.component.html',
  styleUrls: ['./asset-type-template-wizard-step-peers.component.scss']
})
export class AssetTypeTemplateWizardStepPeersComponent implements OnInit {

  @ViewChild(AssetTypeTemplateWizardSharedRelationshipsComponent) peersChild: AssetTypeTemplateWizardSharedRelationshipsComponent;

  @Input() assetTypeTemplate: AssetTypeTemplate;
  @Input() assetTypeTemplateForm: FormGroup;
  @Output() valid = new EventEmitter<boolean>();
  @Output() stepChange = new EventEmitter<number>();

  public peerCandidates: AssetTypeTemplate[];
  public isReadyForNextStep = false;
  public isAddingMode = false;

  constructor(private assetTypeTemplateService: AssetTypeTemplateService) {
  }

  ngOnInit(): void {
    this.initPeerCandidatesIncludingVersion();
  }

  private initPeerCandidatesIncludingVersion() {
    const assetTypeTemplateId = this.assetTypeTemplateForm.get('id').value;
    this.assetTypeTemplateService.getPeerCandidates(assetTypeTemplateId ?? 0)
      .pipe(map( (templates: AssetTypeTemplate[]) =>
          templates.map(template => AssetTypeTemplateWizardStepStartComponent.addPublishedVersionToAssetTypeTemplateName(template))))
      .subscribe(templateCandidates => this.peerCandidates = templateCandidates);
  }

  public onBack(): void {
    if (this.isReadyForNextStep) {
      this.stepChange.emit(AssetTypeTemplateWizardSteps.PEERS - 1);
    }
  }

  public onNext(): void {
    if (this.isReadyForNextStep) {
      this.saveValues();
      this.stepChange.emit(AssetTypeTemplateWizardSteps.PEERS + 1);
    }
  }

  private saveValues(): void {
    const peersFormArray: FormArray = this.peersChild.getFormArray();
    if (peersFormArray.valid) {
      this.assetTypeTemplate.peerIds = new Array<ID>();
      peersFormArray.controls.forEach((peerGroup: FormControl) => {
        this.assetTypeTemplate.peerIds.push(peerGroup.get('id').value);
      });
    }
  }

  public onSetValid(isValid: boolean): void {
    this.isReadyForNextStep = isValid;
    this.valid.emit(isValid);
  }

  public startAddingMode(): void {
    this.isAddingMode = true;
  }

  public addPeer(assetTypeTemplate: AssetTypeTemplate): void {
    this.peersChild.addRelationship(assetTypeTemplate);
    this.isAddingMode = false;
  }
}
