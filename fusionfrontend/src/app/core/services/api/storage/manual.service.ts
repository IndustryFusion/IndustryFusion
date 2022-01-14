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
export class ManualService extends MediaObjectService {

  constructor(http: HttpClient) {
    super(http);
    this.setMediaTypePrefix('application/');
  }

  public static isManualUploaded(manualUrl: string): boolean {
    return manualUrl
      && (manualUrl.startsWith(MediaObjectKeyPrefix.ASSETS + '/') || manualUrl.startsWith(MediaObjectKeyPrefix.ASSET_SERIES + '/'));
  }

  getManual(companyId: ID, manualKey: string): Observable<MediaObject> {
    return this.getMediaObject(companyId, manualKey, MediaObjectType.MANUALS);
  }

  uploadManual(companyId: ID,
               filename: string,
               keyPrefix: MediaObjectKeyPrefix,
               manualContentBase64: string,
               fileSize: number): Observable<MediaObject> {
    if (ManualService.getFileExtension(filename) !== 'pdf') {
      throw new Error('Manual is not in pdf format');
    }

    return this.uploadMediaObject(companyId, filename, keyPrefix, manualContentBase64, fileSize, MediaObjectType.MANUALS);
  }

  deleteManualIfNotOfParent(companyId: ID, manualKey: string, manualKeyParent: string): Observable<boolean> {
    if (manualKey && manualKey !== manualKeyParent) {
      return this.deleteManual(companyId, manualKey).pipe(map(() => true));
    }
    return of(false);
  }

  private deleteManual(companyId: ID, manualKey: string): Observable<void> {
    return this.deleteMediaObject(companyId, manualKey, MediaObjectType.MANUALS);
  }
}
