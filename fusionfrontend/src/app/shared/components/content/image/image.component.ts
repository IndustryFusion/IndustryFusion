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
import { catchError, take } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { CompanyQuery } from '../../../../core/store/company/company.query';
import { ImageService } from '../../../../core/services/api/storage/image.service';
import { ImageStyleType } from '../../../models/image-style-type.model';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit, OnChanges {

  @Input()
  imageKey: string;

  @Input()
  styleType: ImageStyleType;

  @Input()
  prioritizedImageContent: string = null;

  @Input()
  columnSize: number = null;

  @Input()
  isKeyLoading = false;

  @Input()
  preventImageLoading = false;

  @Input()
  isClickable = false;

  @Input()
  alt = 'image'; // TODO (fpa): translation

  @Input()
  fallbackImageKey: string = ImageService.DEFAULT_ASSET_AND_SERIES_IMAGE_KEY;

  @Output()
  clickEvent: EventEmitter<void> = new EventEmitter<void>();

  displayedImage: string;
  prevImageKey: string;
  imageLoadingFailedOrDefault: boolean;
  styleClasses: string;

  constructor(private imageService: ImageService,
              private companyQuery: CompanyQuery) {
  }

  ngOnInit(): void {
    if (this.styleType == null) {
      throw new Error('[Image element]: Please provide style type.');
    }

    this.initStyleClasses();

    this.imageLoadingFailedOrDefault = false;
    this.overwriteDisplayedImageIfProvided();
    if (!this.isImageProvided()) {
      this.loadImage();
    }
  }

  private initStyleClasses() {
    this.styleClasses = this.isClickable ? 'clickable ' : '';
    this.styleClasses += this.columnSize ? `p-col-${this.columnSize} ` : '';

    switch (this.styleType) {
      case ImageStyleType.INFO_PAGE:
        this.styleClasses += 'rounded-image-info';
        break;
      case ImageStyleType.DIALOG:
        this.styleClasses += 'rounded-image-dialogs';
        break;
      case ImageStyleType.WIZARD:
        this.styleClasses += 'rounded-image-wizards';
        break;
      case ImageStyleType.LIST:
        this.styleClasses += 'rounded-image-lists';
        break;
      case ImageStyleType.CARD:
        this.styleClasses += 'card-image';
        break;
    }
  }

  private loadImage() {
    if (this.checkImageDownloadAllowed() && this.imageKey !== this.prevImageKey) {
      this.prevImageKey = this.imageKey;
      this.imageLoadingFailedOrDefault = false;

      const companyId = this.companyQuery.getActiveId();
      this.imageService.getImageAsUriSchemeString(companyId, this.imageKey)
        .pipe(catchError(err => {
            console.error('[Image element]: ' + err);
            this.imageLoadingFailedOrDefault = true;
            return EMPTY;
          }),
          take(1)
        )
        .subscribe(imageText => {
          this.displayedImage = imageText;
          this.imageLoadingFailedOrDefault = false;
        });
    }
  }

  private checkImageDownloadAllowed(): boolean {
    if (this.isKeyLoading || this.preventImageLoading || this.isImageProvided()) {
      return false;
    }

    if (this.imageKey === this.fallbackImageKey) {
      this.imageLoadingFailedOrDefault = true;
      return false;
    }

    if (!this.imageKey || this.imageKey.trim() === '') {
      this.imageLoadingFailedOrDefault = true;
      console.warn('[Image element]: Image key is not provided.');
      return false;
    }

    return true;
  }

  private isImageProvided(): boolean {
    return this.prioritizedImageContent != null;
  }

  private overwriteDisplayedImageIfProvided() {
    if (this.prioritizedImageContent) {
      this.displayedImage = this.prioritizedImageContent;
      this.imageLoadingFailedOrDefault = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.prioritizedImageContent && !changes.prioritizedImageContent.isFirstChange())
      || (changes.preventImageLoading && !changes.preventImageLoading.isFirstChange())) {
      this.overwriteDisplayedImageIfProvided();

      if (!this.isImageProvided()) {
        this.loadImage();
      }
    }

    if (changes.imageKey && !changes.imageKey.isFirstChange()) {
      this.loadImage();
    }

    if (changes.isClickable || changes.isAssetCardStyling) {
      this.initStyleClasses();
    }
  }

  onClick() {
    if (this.isClickable) {
      this.clickEvent.emit();
    }
  }
}
