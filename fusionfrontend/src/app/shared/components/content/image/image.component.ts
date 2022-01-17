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

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit, OnChanges {

  @Input()
  imageKey: string;

  @Input()
  isAssetCardStyling = false;

  @Input()
  isClickable = false;

  @Input()
  alt = 'image'; // TODO (fpa): translation

  @Output()
  clickEvent: EventEmitter<void> = new EventEmitter<void>();

  assetImage: string;
  prevImageKey: string;
  assetImageLoadingFailedOrDefault: boolean;

  fallbackImageKey: string = ImageService.DEFAULT_ASSET_IMAGE_KEY;
  styleClasses: string;

  constructor(private imageService: ImageService,
              private companyQuery: CompanyQuery) {
  }

  ngOnInit(): void {
    this.assetImageLoadingFailedOrDefault = false;
    this.initStyleClasses();
    this.loadImage();
  }

  private initStyleClasses() {
    this.styleClasses = this.isClickable ? 'clickable' : '';
    this.styleClasses += this.isAssetCardStyling ? ' asset-card' : '';
  }

  private loadImage() {
    if (!this.imageKey) {
      this.assetImageLoadingFailedOrDefault = true;
      console.warn('[Image element]: Image key is not provided.');
      return;
    }

    if (this.imageKey !== this.prevImageKey) {
      console.log(this.imageKey, this.prevImageKey);
      this.prevImageKey = this.imageKey;
      this.assetImageLoadingFailedOrDefault = false;

      const companyId = this.companyQuery.getActiveId();
      this.imageService.getImageAsUriSchemeString(companyId, this.imageKey)
        .pipe(catchError(err => {
            console.error('[Image element]: ' + err);
            this.assetImageLoadingFailedOrDefault = true;
            return EMPTY;
          }),
          take(1)
        )
        .subscribe(imageText => {
          this.assetImage = imageText;
          this.assetImageLoadingFailedOrDefault = false;
        });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.imageKey && !changes.imageKey.isFirstChange()) {
      this.loadImage();
    } else if (changes.isClickable || changes.isAssetCardStyling) {
      this.initStyleClasses();
    }
  }

  onClick() {
    if (this.isClickable) {
      this.clickEvent.emit();
    }
  }
}
