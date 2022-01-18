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
export class VideoService extends MediaObjectService {

  constructor(http: HttpClient) {
    super(http);
    this.setMediaTypePrefix('video/');
  }

  public static isVideoUploaded(videoKey: string): boolean {
    return videoKey
      && (videoKey.startsWith(MediaObjectKeyPrefix.ASSETS + '/') || videoKey.startsWith(MediaObjectKeyPrefix.ASSET_SERIES + '/'));
  }

  getVideo(companyId: ID, videoKey: string): Observable<MediaObject> {
    return this.getMediaObject(companyId, videoKey, MediaObjectType.VIDEOS);
  }

  uploadVideo(companyId: ID,
              filename: string,
              keyPrefix: MediaObjectKeyPrefix,
              videoContentBase64: string,
              fileSize: number): Observable<MediaObject> {
    return this.uploadMediaObject(companyId, filename, keyPrefix, videoContentBase64, fileSize, MediaObjectType.VIDEOS);
  }

  deleteVideoIfNotOfParent(companyId: ID, videoKey: string, videoKeyParent: string): Observable<boolean> {
    if (videoKey && videoKey !== videoKeyParent) {
      return this.deleteVideo(companyId, videoKey).pipe(map(() => true));
    }
    return of(false);
  }

  private deleteVideo(companyId: ID, videoKey: string): Observable<void> {
    return this.deleteMediaObject(companyId, videoKey, MediaObjectType.VIDEOS);
  }
}
