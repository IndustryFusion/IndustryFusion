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
import {
  AssetTypeTemplate,
  AssetTypeTemplatePeer
} from '../../../../../../../core/store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateService } from '../../../../../../../core/store/asset-type-template/asset-type-template.service';
import { AssetTypeTemplateWizardSteps } from '../../asset-type-template-wizard-steps.model';
import { FormArray, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { AssetTypeTemplateWizardStepStartComponent } from '../asset-type-template-wizard-step-start/asset-type-template-wizard-step-start.component';
import { AssetTypeTemplateWizardSharedPeersComponent } from '../../asset-type-template-wizard-shared/asset-type-template-wizard-shared-peers/asset-type-template-wizard-shared-peers.component';
import { ID } from '@datorama/akita';

@Component({
  selector: 'app-asset-type-template-wizard-step-peers',
  templateUrl: './asset-type-template-wizard-step-peers.component.html',
  styleUrls: ['./asset-type-template-wizard-step-peers.component.scss']
})
export class AssetTypeTemplateWizardStepPeersComponent implements OnInit {

  @ViewChild(AssetTypeTemplateWizardSharedPeersComponent) peersChild: AssetTypeTemplateWizardSharedPeersComponent;

  @Input() assetTypeTemplate: AssetTypeTemplate;
  @Input() assetTypeTemplateForm: FormGroup;
  @Output() valid = new EventEmitter<boolean>();
  @Output() stepChange = new EventEmitter<number>();

  peerCandidates: AssetTypeTemplate[];
  removedCandidates: AssetTypeTemplate[];

  isReadyForNextStep = false;
  isAddingMode = false;

  constructor(private assetTypeTemplateService: AssetTypeTemplateService) {
    this.removedCandidates = [];
  }

  ngOnInit(): void {
    this.initPeerCandidatesWithVersionExcludingSubsystems();
    this.addAddedPeersToRemovedCandidates();
  }

  private initPeerCandidatesWithVersionExcludingSubsystems() {
    const assetTypeTemplateId = this.assetTypeTemplateForm.get('id').value;
    const peerCandidates$ = this.assetTypeTemplateService.getPeerCandidates(assetTypeTemplateId ?? -1)
      .pipe(map( (candidates: AssetTypeTemplate[]) =>
          candidates.map(candidate => AssetTypeTemplateWizardStepStartComponent.addPublishedVersionToAssetTypeTemplateName(candidate))),
        map(candidates => candidates.filter(candidate => !this.assetTypeTemplate.subsystemIds.includes(candidate.id) )),
        map(candidates => candidates.filter(candidate => !this.assetTypeTemplate.peers.map(peer => peer.peerId).includes(candidate.id) )));

    peerCandidates$.subscribe(templateCandidates => this.peerCandidates = templateCandidates);
  }

  private addAddedPeersToRemovedCandidates() {
    this.assetTypeTemplate.peers?.forEach(assetTypeTemplatePeer => {
      const addedPeer = assetTypeTemplatePeer.peer;
      if (addedPeer) {
        this.removedCandidates.push(AssetTypeTemplateWizardStepStartComponent.addPublishedVersionToAssetTypeTemplateName(addedPeer));
      } else {
        console.warn('[ATT wizard]: Peer could not be found in candidates');
      }
    });
  }

  onBack(): void {
    this.changeStep(AssetTypeTemplateWizardSteps.PEERS - 1);
  }

  onNext(): void {
    this.changeStep(AssetTypeTemplateWizardSteps.PEERS + 1);
  }

  private changeStep(step: number) {
    if (this.isReadyForNextStep) {
      this.saveValues();
      this.stepChange.emit(step);
    }
  }

  private saveValues(): void {
    const peersFormArray: FormArray = this.peersChild.getFormArray();
    if (peersFormArray.valid) {
      this.assetTypeTemplate.peers = new Array<AssetTypeTemplatePeer>();

      peersFormArray.controls.forEach((uncleanedPeerGroup: FormGroup) => {
        const assetTypeTemplatePeer = this.peersChild.cleanFormGroupAndGetAssetTypeTemplatePeer(uncleanedPeerGroup);
        this.assetTypeTemplate.peers.push(assetTypeTemplatePeer);
      });
    }
  }

  onSetValid(isValid: boolean): void {
    this.isReadyForNextStep = isValid;
    this.valid.emit(isValid);
  }

  startAddingMode(): void {
    this.isAddingMode = true;
  }

  addPeer(peer: AssetTypeTemplate): void {
    this.peersChild.addPeer(peer);
    this.removedCandidates.push(peer);
    this.peerCandidates.splice(this.peerCandidates.indexOf(peer), 1);
    this.isAddingMode = false;
  }

  public onPeerRemoved(peerId: ID): void {
    const removedPeer: AssetTypeTemplate = this.removedCandidates.find((peer: AssetTypeTemplate) => peer.id === peerId);
    if (!removedPeer) {
      console.warn('[ATT wizard]: Removed peer could not be found');
      return;
    }

    this.addRemovedPeerToCandidates(removedPeer);
    this.removedCandidates.splice(this.removedCandidates.indexOf(removedPeer), 1);
  }

  private addRemovedPeerToCandidates(removedPeer: AssetTypeTemplate) {
    if (removedPeer) {
      this.peerCandidates.push(removedPeer);
      this.peerCandidates.sort((a, b) => (a.id as number) - (b.id as number));
    }
  }
}
