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
import { FusionImage } from '../../models/fusion-image.model';
import { map } from 'rxjs/operators';
import { ID } from '@datorama/akita';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {
  }

  private static getFileExtension(filename: string): string {
    const parts: string[] = filename.split('.');
    return parts.length > 0 ? parts[parts.length - 1] : 'jpeg';
  }

  getImage(companyId: ID, imageKey: string): Observable<string> {
    const path = `companies/${companyId}/images/${imageKey}`;
    return this.http.get<FusionImage>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions).pipe(
      map((fusionImage: FusionImage) => `data:${fusionImage.contentType};base64,${fusionImage.imageContentBase64}`
    ));
  }

  uploadImage(companyId: ID, imageKey: string, imageContentBase64: string, fileSize: number): Observable<FusionImage> {
    const path = `companies/${companyId}/images`;
    const image: FusionImage = new FusionImage(companyId, imageKey, imageContentBase64,
      'image/' + ImageService.getFileExtension(imageKey), fileSize);

    return this.http.post<FusionImage>(`${environment.apiUrlPrefix}/${path}`, image, this.httpOptions);
  }
}
