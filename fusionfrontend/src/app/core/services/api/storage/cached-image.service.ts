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

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MediaObject, MediaObjectKeyPrefix, MediaObjectType } from '../../../models/media-object.model';
import { map } from 'rxjs/operators';
import { ID } from '@datorama/akita';
import { MediaObjectService } from './media-object.service';

@Injectable({
  providedIn: 'root'
})
export class CachedImageService extends MediaObjectService {

  public static DEFAULT_ASSET_AND_SERIES_IMAGE_KEY = 'default-image-asset-and-series.png';

  constructor(http: HttpClient) {
    super(http);
    this.setMediaTypePrefix('image/');
    this.enableCache();
  }

  getImageAsUriSchemeString(companyId: ID, imageKey: string): Observable<string> {
    return this.getMediaObjectAsUriSchemeString(companyId, imageKey, MediaObjectType.IMAGES);
  }

  uploadImage(companyId: ID,
              filename: string,
              keyPrefix: MediaObjectKeyPrefix,
              imageContentBase64: string,
              fileSize: number): Observable<MediaObject> {
    return this.uploadMediaObject(companyId, filename, keyPrefix, imageContentBase64, fileSize, MediaObjectType.IMAGES);
  }

  deleteImageIfNotDefault(companyId: ID, imageKey: string, imageKeyDefault: string): Observable<boolean> {
    if (imageKey && imageKey !== imageKeyDefault) {
      return this.deleteImage(companyId, imageKey).pipe(map(() => true));
    }
    return of(false);
  }

  deleteImageIfNotDefaultNorParent(companyId: ID, imageKey: string, imageKeyDefault: string, imageKeyParent: string): Observable<boolean> {
    if (imageKey && imageKey !== imageKeyDefault && imageKey !== imageKeyParent) {
      return this.deleteImage(companyId, imageKey).pipe(map(() => true));
    }
    return of(false);
  }

  private deleteImage(companyId: ID, imageKey: string): Observable<void> {
    return this.deleteMediaObject(companyId, imageKey, MediaObjectType.IMAGES);
  }
}
