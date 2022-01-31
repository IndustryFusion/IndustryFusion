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

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AssetWizardStep } from '../asset-wizard-step.model';
import { SelectItem } from 'primeng/api';
import { ProtectionClassService } from '../../../../../../core/services/api/protection-class.service';
import { MediaObject, MediaObjectKeyPrefix } from '../../../../../../core/models/media-object.model';
import { CompanyQuery } from '../../../../../../core/store/company/company.query';
import { ID } from '@datorama/akita';
import { ManualService } from '../../../../../../core/services/api/storage/manual.service';
import { AssetSeries } from '../../../../../../core/store/asset-series/asset-series.model';
import { VideoService } from '../../../../../../core/services/api/storage/video.service';

@Component({
  selector: 'app-asset-wizard-step-nameplate',
  templateUrl: './asset-wizard-step-nameplate.component.html',
  styleUrls: ['./asset-wizard-step-nameplate.component.scss']
})
export class AssetWizardStepNameplateComponent implements OnInit, OnDestroy {

  @Input() assetForm: FormGroup;
  @Input() relatedAssetSeries: AssetSeries;
  @Output() stepChange = new EventEmitter<number>();

  public protectionClasses: SelectItem[] = [];
  public yearRange: string;

  private companyId: ID;
  private hiddenManualKey: string;
  private hiddenVideoKey: string;
  private isDestroyed = false;

  constructor(private protectionClassService: ProtectionClassService,
              private manualService: ManualService,
              private videoService: VideoService,
              private companyQuery: CompanyQuery) { }

  ngOnInit(): void {
    this.companyId = this.companyQuery.getActiveId();
    this.yearRange = `${ new Date().getFullYear() - 8 }:${ new Date().getFullYear() + 2}`;
    this.protectionClassService.getProtectionClasses().subscribe(protectionClasses => {
      protectionClasses.forEach(protectionClass => {
        this.protectionClasses.push({ label: protectionClass.toString(), value: protectionClass.toString() });
        this.assetForm.get('protectionClass').setValue(this.assetForm.get('protectionClass')?.value);
      });
    });

    if (ManualService.isManualUploaded(this.assetForm?.get('manualKey').value)) {
      this.hideManualKeyAndDisable(this.assetForm.get('manualKey').value);
    }
    if (VideoService.isVideoUploaded(this.assetForm?.get('videoKey').value)) {
      this.hideVideoKeyAndDisable(this.assetForm.get('videoKey').value);
    }
  }

  private hideManualKeyAndDisable(manualKey: string) {
    this.hiddenManualKey = manualKey;
    this.assetForm.get('manualKey').setValue(MediaObject.getFilename(manualKey));
    this.assetForm.get('manualKey').disable();

    if (this.isDestroyed) {
      this.restoreHiddenManualKeyAndEnable();
    }
  }

  private hideVideoKeyAndDisable(videoKey: string) {
    this.hiddenVideoKey = videoKey;
    this.assetForm.get('videoKey').setValue(MediaObject.getFilename(videoKey));
    this.assetForm.get('videoKey').disable();

    if (this.isDestroyed) {
      this.restoreHiddenVideoKeyAndEnable();
    }
  }

  ngOnDestroy() {
    this.restoreHiddenKeysAndEnable();
    this.isDestroyed = true;
  }

  private restoreHiddenKeysAndEnable() {
    this.restoreHiddenManualKeyAndEnable();
    this.restoreHiddenVideoKeyAndEnable();
  }

  private restoreHiddenManualKeyAndEnable() {
    if (this.hiddenManualKey) {
      this.assetForm.get('manualKey').setValue(this.hiddenManualKey);
      this.hiddenManualKey = null;
    }
    this.assetForm.get('manualKey').enable();
  }

  private restoreHiddenVideoKeyAndEnable() {
    if (this.hiddenVideoKey) {
      this.assetForm.get('videoKey').setValue(this.hiddenVideoKey);
      this.hiddenVideoKey = null;
    }
    this.assetForm.get('videoKey').enable();
  }

  onBack(): void {
    this.restoreHiddenKeysAndEnable();
    this.stepChange.emit(AssetWizardStep.DIGITAL_NAMEPLATE - 1);
  }

  onNext(): void {
    if (this.isReadyForNextStep()) {
      this.restoreHiddenKeysAndEnable();
      this.stepChange.emit(AssetWizardStep.DIGITAL_NAMEPLATE + 1);
    }
  }

  isReadyForNextStep(): boolean {
    return this.assetForm.valid;
  }


  onManualUpload(event: any) {
    this.deletePreviouslyUploadedManual();

    const selectedManual: any = event.target.files[0];
    if (selectedManual) {
      const reader = new FileReader();
      reader.addEventListener('load', (readFileEvent: any) => {
        this.assetForm.get('isManualNotUploading').setValue(false);

        this.manualService.uploadManual(this.companyId, selectedManual.name, MediaObjectKeyPrefix.ASSETS,
          readFileEvent.target.result, selectedManual.size).subscribe(uploadedManual => {
            this.hideManualKeyAndDisable(uploadedManual.fileKey);
            this.assetForm.get('isManualNotUploading').setValue(true);
          });
      });

      reader.readAsDataURL(selectedManual);
    }
  }

  deletePreviouslyUploadedManual(): void {
    if (this.isManualUploaded()) {
      this.manualService.deleteManualIfNotOfParent(this.companyId, this.hiddenManualKey,
        this.relatedAssetSeries.manualKey).subscribe(() => this.resetManualKey());
    }
  }

  private resetManualKey() {
    this.hiddenManualKey = null;
    this.assetForm.get('manualKey').setValue(null);
    this.assetForm.get('manualKey').enable();
  }

  isManualUploaded(): boolean {
    return this.hiddenManualKey != null;
  }


  onVideoUpload(event: any) {
    this.deletePreviouslyUploadedVideo();

    const selectedVideo: any = event.target.files[0];
    if (selectedVideo) {
      const reader = new FileReader();
      reader.addEventListener('load', (readFileEvent: any) => {
        this.assetForm.get('isVideoNotUploading').setValue(false);

        this.videoService.uploadVideo(this.companyId, selectedVideo.name, MediaObjectKeyPrefix.ASSETS,
          readFileEvent.target.result, selectedVideo.size).subscribe(uploadedVideo => {
            this.hideVideoKeyAndDisable(uploadedVideo.fileKey);
            this.assetForm.get('isVideoNotUploading').setValue(true);
          });
      });

      reader.readAsDataURL(selectedVideo);
    }
  }

  deletePreviouslyUploadedVideo(): void {
    if (this.isVideoUploaded()) {
      this.videoService.deleteVideoIfNotOfParent(this.companyId, this.hiddenVideoKey,
        this.relatedAssetSeries.videoKey).subscribe(() => this.resetVideoKey());
    }
  }

  private resetVideoKey() {
    this.hiddenVideoKey = null;
    this.assetForm.get('videoKey').setValue(null);
    this.assetForm.get('videoKey').enable();
  }

  isVideoUploaded(): boolean {
    return this.hiddenVideoKey != null;
  }
}
