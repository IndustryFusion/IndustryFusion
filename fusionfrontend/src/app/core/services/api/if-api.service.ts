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
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IfApiService {

  httpOptions = {
    headers: new HttpHeaders({ /*enctype: 'multipart/form-data',*/ Accept: 'application/zip' })
  };

  constructor(private http: HttpClient) {
  }

  getExportLinkEcosystemManager(asOWL: boolean): string {
    let path = `/export`;
    if (asOWL) {
      path = '/owlexport';
    }
    return `${environment.apiUrlPrefix}${path}`;
  }

  uploadZipFileForFactoryManagerImport(companyId: ID, factorySiteId, file: File): Observable<void> {
    const path = `companies/${companyId}/factorysites/${factorySiteId}/import`;
    const formDataZipFile: FormData = new FormData();
    formDataZipFile.append('zipFile', file, file.name);

    return this.http.post<void>(`${environment.apiUrlPrefix}/${path}`, formDataZipFile, this.httpOptions);
  }

  importEcosystemManagerDataToFactoryManager(companyId: ID, file: File): Observable<void> {
    const path = `companies/${companyId}/factorymanager/import`;
    const formDataZipFile: FormData = new FormData();
    formDataZipFile.append('zipFile', file, file.name);

    return this.http.post<void>(`${environment.apiUrlPrefix}/${path}`, formDataZipFile, this.httpOptions);
  }

  getExportLinkFleetManager(companyId: ID): string {
    const path = `companies/${companyId}/fleetmanager/export`;
    return `${environment.apiUrlPrefix}/${path}`;
  }

  uploadZipFileForFleetManagerImport(companyId: ID, file: File): Observable<void> {
    const path = `companies/${companyId}/fleetmanager/import`;
    const formDataZipFile: FormData = new FormData();
    formDataZipFile.append('zipFile', file, file.name);

    return this.http.post<void>(`${environment.apiUrlPrefix}/${path}`, formDataZipFile, this.httpOptions);
  }

  exportOnboardingPackage(companyId: ID, assetId: ID, assetSeriesId: ID, yamlContent: string): Observable<void> {
    const path = `companies/${companyId}/assetseries/${assetSeriesId}/assets/${assetId}/onboardingexport`;
    const formDataZipFile: FormData = new FormData();
    formDataZipFile.append('applicationYaml', yamlContent, 'application.yaml');

    return this.http.post<void>(`${environment.apiUrlPrefix}/${path}`, formDataZipFile, this.httpOptions);
  }
}
