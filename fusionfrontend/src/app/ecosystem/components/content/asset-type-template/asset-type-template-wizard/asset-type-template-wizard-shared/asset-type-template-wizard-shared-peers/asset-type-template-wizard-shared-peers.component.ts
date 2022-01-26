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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AssetTypeTemplate,
  AssetTypeTemplatePeer,
  PeerCardinality
} from '../../../../../../../core/store/asset-type-template/asset-type-template.model';
import { AssetTypeTemplateQuery } from '../../../../../../../core/store/asset-type-template/asset-type-template.query';
import { WizardHelper } from '../../../../../../../core/helpers/wizard-helper';
import { AssetTypeTemplateWizardStepStartComponent } from '../../asset-type-template-wizard-step/asset-type-template-wizard-step-start/asset-type-template-wizard-step-start.component';
import { EnumHelpers } from '../../../../../../../core/helpers/enum-helpers';
import { ID } from '@datorama/akita';

@Component({
  selector: 'app-asset-type-template-wizard-shared-peers',
  templateUrl: './asset-type-template-wizard-shared-peers.component.html',
  styleUrls: ['./asset-type-template-wizard-shared-peers.component.scss']
})
export class AssetTypeTemplateWizardSharedPeersComponent implements OnInit, OnChanges {

  @Input() editable = true;
  @Input() isReview = false;

  @Input() assetTypeTemplatePeers: Array<AssetTypeTemplatePeer>;
  @Output() changeIsValid = new EventEmitter<boolean>();
  @Output() backToEditPage = new EventEmitter<void>();
  @Output() peerRemoved = new EventEmitter<ID>();

  cardinalityOptions: { name: string, value: string }[];
  peerFormArray: FormArray;

  constructor(private formBuilder: FormBuilder,
              enumHelpers: EnumHelpers,
              private assetTypeTemplateQuery: AssetTypeTemplateQuery) {
    this.cardinalityOptions = enumHelpers.getDropdownOptions(PeerCardinality);
  }

  ngOnInit(): void {
    if (!this.assetTypeTemplatePeers) {
      this.assetTypeTemplatePeers = new Array<AssetTypeTemplatePeer>();
    }
    this.initFormArray();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assetTypeTemplatePeers && !changes.assetTypeTemplatePeers.firstChange) {
      this.initFormArray();
    }
  }

  private initFormArray(): void {
    this.peerFormArray = new FormArray([]);
    this.peerFormArray.valueChanges.subscribe(() => this.changeIsValid.emit(this.isValid()));
    this.changeIsValid.emit(this.isValid());

    for (const assetTypeTemplatePeer of this.assetTypeTemplatePeers) {
      const assetTypeTemplate: AssetTypeTemplate = AssetTypeTemplateWizardStepStartComponent
        .addPublishedVersionToAssetTypeTemplateName(this.assetTypeTemplateQuery.getEntity(assetTypeTemplatePeer.peerId));
      this.addPeer(assetTypeTemplate, assetTypeTemplatePeer);
    }
    this.changeIsValid.emit(this.isValid());
  }

  isConfirmed(assetTypeTemplatePeerGroup: AbstractControl): boolean {
    return assetTypeTemplatePeerGroup.get('confirmed').value;
  }

  private isValid(): boolean {
    return this.peerFormArray.valid;
  }

  public addPeer(peer: AssetTypeTemplate, existingAssetTypeTemplatePeer: AssetTypeTemplatePeer = null): void {
    const isNew = existingAssetTypeTemplatePeer != null;
    const assetTypeTemplatePeerGroup = this.formBuilder.group({
      id: [],
      index: [this.peerFormArray.length],
      peerId: [peer.id],
      peer: [peer],
      customName: [peer.name, WizardHelper.requiredTextValidator],
      name: [peer.name],
      imageKey: [peer.imageKey],
      mandatory: [false, Validators.required],
      cardinality: [PeerCardinality.ONE, Validators.required],
      confirmed: [isNew, Validators.requiredTrue]
    });

    if (existingAssetTypeTemplatePeer) {
      assetTypeTemplatePeerGroup.patchValue(existingAssetTypeTemplatePeer);
    }
    this.peerFormArray.push(assetTypeTemplatePeerGroup);
  }

  public cleanFormGroupAndGetAssetTypeTemplatePeer(assetTypeTemplatePeerGroup: FormGroup): AssetTypeTemplatePeer {
    assetTypeTemplatePeerGroup.removeControl('name');
    assetTypeTemplatePeerGroup.removeControl('index');
    assetTypeTemplatePeerGroup.removeControl('imageKey');
    assetTypeTemplatePeerGroup.removeControl('confirmed');

    return assetTypeTemplatePeerGroup.getRawValue() as AssetTypeTemplatePeer;
  }

  public getFormArray(): FormArray {
    return this.peerFormArray;
  }

  onEdit(assetTypeTemplatePeerGroup: AbstractControl): void {
    if (this.isReview) {
      this.backToEditPage.emit();
    } else {
      assetTypeTemplatePeerGroup.get('confirmed').patchValue(false);
    }
  }

  onConfirm(assetTypeTemplatePeerGroup: AbstractControl): void {
    if (assetTypeTemplatePeerGroup) {
      assetTypeTemplatePeerGroup.get('confirmed').patchValue(true);
    }
  }

  onDelete(assetTypeTemplatePeerGroup: AbstractControl): void {
    if (this.isReview) {
      this.backToEditPage.emit();
    } else if (assetTypeTemplatePeerGroup != null) {
      WizardHelper.removeSubsystemFromFormArray(assetTypeTemplatePeerGroup, this.peerFormArray);
      this.peerRemoved.emit(assetTypeTemplatePeerGroup.get('peerId').value);
    }
  }

  toFormGroup(assetTypeTemplatePeerGroup: AbstractControl): FormGroup {
    return assetTypeTemplatePeerGroup as FormGroup;
  }
}
