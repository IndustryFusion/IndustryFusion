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
  private hiddenManualUrl: string;
  private hiddenVideoUrl: string;

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

    if (ManualService.isManualUploaded(this.assetForm?.get('handbookUrl').value)) {
      this.hideManualUrlAndDisable(this.assetForm.get('handbookUrl').value);
    }
    if (VideoService.isVideoUploaded(this.assetForm?.get('videoUrl').value)) {
      this.hideVideoUrlAndDisable(this.assetForm.get('videoUrl').value);
    }
  }

  private hideManualUrlAndDisable(manualKey: string) {
    this.hiddenManualUrl = manualKey;
    this.assetForm.get('handbookUrl').setValue(MediaObject.getFilename(manualKey));
    this.assetForm.get('handbookUrl').disable();
  }

  private hideVideoUrlAndDisable(videoKey: string) {
    this.hiddenVideoUrl = videoKey;
    this.assetForm.get('videoUrl').setValue(MediaObject.getFilename(videoKey));
    this.assetForm.get('videoUrl').disable();
  }

  ngOnDestroy() {
    this.restoreHiddenUrlsAndEnable();
  }

  private restoreHiddenUrlsAndEnable() {
    this.restoreHiddenManualUrlAndEnable();
    this.restoreHiddenVideoUrlAndEnable();
  }

  private restoreHiddenManualUrlAndEnable() {
    if (this.hiddenManualUrl) {
      this.assetForm.get('handbookUrl').setValue(this.hiddenManualUrl);
      this.hiddenManualUrl = null;
    }
    this.assetForm.get('handbookUrl').enable();
  }

  private restoreHiddenVideoUrlAndEnable() {
    if (this.hiddenVideoUrl) {
      this.assetForm.get('videoUrl').setValue(this.hiddenVideoUrl);
      this.hiddenVideoUrl = null;
    }
    this.assetForm.get('videoUrl').enable();
  }

  onBack(): void {
    this.restoreHiddenUrlsAndEnable();
    this.stepChange.emit(AssetWizardStep.DIGITAL_NAMEPLATE - 1);
  }

  onNext(): void {
    if (this.isReadyForNextStep()) {
      this.restoreHiddenUrlsAndEnable();
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
        this.manualService.uploadManual(this.companyId, selectedManual.name, MediaObjectKeyPrefix.ASSETS,
          readFileEvent.target.result, selectedManual.size)
          .subscribe(uploadedManual => {
            this.hideManualUrlAndDisable(uploadedManual.fileKey);
          });
      });

      reader.readAsDataURL(selectedManual);
    }
  }

  deletePreviouslyUploadedManual(): void {
    if (this.isManualUploaded()) {
      this.manualService.deleteManualIfNotOfParent(this.companyId, this.assetForm.get('handbookUrl').value,
        this.relatedAssetSeries.handbookUrl).subscribe(() => {
        this.assetForm.get('handbookUrl').setValue(null);
        this.assetForm.get('handbookUrl').enable();
      });
    }
  }

  isManualUploaded(): boolean {
    return this.hiddenManualUrl != null;
  }


  onVideoUpload(event: any) {
    this.deletePreviouslyUploadedVideo();

    const selectedVideo: any = event.target.files[0];
    if (selectedVideo) {
      const reader = new FileReader();
      reader.addEventListener('load', (readFileEvent: any) => {
        this.videoService.uploadVideo(this.companyId, selectedVideo.name, MediaObjectKeyPrefix.ASSETS,
          readFileEvent.target.result, selectedVideo.size)
          .subscribe(uploadedVideo => {
            this.hideVideoUrlAndDisable(uploadedVideo.fileKey);
          });
      });

      reader.readAsDataURL(selectedVideo);
    }
  }

  deletePreviouslyUploadedVideo(): void {
    if (this.isVideoUploaded()) {
      this.videoService.deleteVideoIfNotOfParent(this.companyId, this.assetForm.get('videoUrl').value,
        this.relatedAssetSeries.videoUrl).subscribe(() => {
        this.assetForm.get('videoUrl').setValue(null);
        this.assetForm.get('videoUrl').enable();
      });
    }
  }

  isVideoUploaded(): boolean {
    return this.hiddenVideoUrl != null;
  }
}
