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
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MediaObject } from '../../models/fusion-image.model';
import { map } from 'rxjs/operators';
import { ID } from '@datorama/akita';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  public static DEFAULT_ASSET_IMAGE_KEY = 'default-avatar-asset.png';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {
  }

  private static getFileExtension(filename: string): string {
    const parts: string[] = filename.split('.');
    return parts.length > 0 ? parts[parts.length - 1] : 'jpeg';
  }

  private static escapeSlash(text: string): string {
    return text.replace('/', '$');
  }

  getImage(companyId: ID, imageKey: string): Observable<MediaObject> {
    const path = `companies/${companyId}/images/${ImageService.escapeSlash(imageKey)}`;
    return this.http.get<MediaObject>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }

  getImageAsUriSchemeString(companyId: ID, imageKey: string): Observable<string> {
   return this.getImage(companyId, imageKey).pipe(
      map((fusionImage: MediaObject) => `data:${fusionImage.contentType};base64,${fusionImage.contentBase64}`
      ));
  }

  uploadImage(companyId: ID, filename: string, folder: string, imageContentBase64: string, fileSize: number): Observable<MediaObject> {
    const path = `companies/${companyId}/images`;
    const image: MediaObject = new MediaObject(companyId, filename, folder, imageContentBase64,
      'image/' + ImageService.getFileExtension(filename), fileSize);

    return this.http.post<MediaObject>(`${environment.apiUrlPrefix}/${path}`, image, this.httpOptions);
  }

  deleteImage(companyId: ID, imageKey: string): Observable<void> {
    const path = `companies/${companyId}/images/${ImageService.escapeSlash(imageKey)}`;
    return this.http.delete<void>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }
}
