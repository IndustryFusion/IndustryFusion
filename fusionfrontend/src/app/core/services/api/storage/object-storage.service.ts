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
import { EMPTY, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MediaObject, MediaObjectType } from '../../../models/media-object.model';
import { map } from 'rxjs/operators';
import { ID } from '@datorama/akita';

@Injectable({
  providedIn: 'root'
})
export abstract class ObjectStorageService {

  private mediaTypePrefix: string;
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  protected constructor(private readonly http: HttpClient) {
  }

  protected static getFileExtension(filename: string): string {
    const parts: string[] = filename.split('.');
    if (parts.length > 0) {
      return parts[parts.length - 1];
    } else {
      throw new Error('File extension could not be retrieved');
    }
  }

  private static escapeSlash(text: string): string {
    return text.replace('/', '$');
  }

  protected setMediaTypePrefix(mediaTypePrefix: string): void {
    this.mediaTypePrefix = mediaTypePrefix;
  }

  protected getMediaObjectAsUriSchemeString(companyId: ID,
                                            mediaObjectKey: string,
                                            mediaObjectType: MediaObjectType): Observable<string> {
    if (mediaObjectKey == null) {
      console.error(`[${mediaObjectType} service]: Empty ${mediaObjectType} key`);
      return EMPTY;
    }

    return this.getMediaObject(companyId, mediaObjectKey, mediaObjectType).pipe(
      map((mediaObject: MediaObject) => {
          if (!mediaObject.contentBase64.startsWith('data')) {
            return `data:${mediaObject.contentType};base64,${mediaObject.contentBase64}`;
          }
          return mediaObject.contentBase64;
        }
      ));
  }

  private getMediaObject(companyId: ID,
                         mediaObjectKey: string,
                         mediaObjectType: MediaObjectType): Observable<MediaObject> {
    const path = `companies/${companyId}/${mediaObjectType}/${ObjectStorageService.escapeSlash(mediaObjectKey)}`;

    this.setHeaderContentType(mediaObjectKey);
    return this.http.get<MediaObject>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }

  protected uploadMediaObject(companyId: ID,
                              filename: string,
                              folder: string,
                              mediaContentBase64: string,
                              fileSize: number,
                              mediaObjectType: MediaObjectType): Observable<MediaObject> {
    const path = `companies/${companyId}/${mediaObjectType}`;
    const mediaObject: MediaObject = new MediaObject(companyId, filename, folder, mediaContentBase64,
      this.getContentType(filename), fileSize);

    this.setHeaderContentType(filename);
    return this.http.post<MediaObject>(`${environment.apiUrlPrefix}/${path}`, mediaObject, this.httpOptions);
  }

  protected deleteMediaObject(companyId: ID,
                              mediaObjectKey: string,
                              mediaObjectType: MediaObjectType): Observable<void> {
    const path = `companies/${companyId}/${mediaObjectType}/${ObjectStorageService.escapeSlash(mediaObjectKey)}`;

    this.setHeaderContentType(mediaObjectKey);
    return this.http.delete<void>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }

  private setHeaderContentType(filename: string): void {
    this.httpOptions.headers.set('Content-Type', this.getContentType(filename));
  }

  private getContentType(filename: string): string {
    return this.mediaTypePrefix + ObjectStorageService.getFileExtension(filename);
  }
}
