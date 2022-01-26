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
    headers: new HttpHeaders({ Accept: 'application/zip' })
  };
  syncResult: SyncResult = new SyncResult();
  showResult: boolean = false;

  constructor(private http: HttpClient) {
  }

  getExportLinkEcosystemManager(exportType: string): string {
    let path;
    switch (exportType) {
      case ExportType.ZIP:
        path = `/zipexport`;
        break;
      case ExportType.OWL:
        path = `/owlexport`;
        break;
      case ExportType.GIT:
        path = `/synctomodelrepo`;
        break;
      default:
        break;
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
    const path = `companies/${companyId}/fleetmanager/zipexport`;
    return `${environment.apiUrlPrefix}/${path}`;
  }

  uploadZipFileForFleetManagerImport(companyId: ID, file: File): Observable<void> {
    const path = `companies/${companyId}/fleetmanager/import`;
    const formDataZipFile: FormData = new FormData();
    formDataZipFile.append('zipFile', file, file.name);

    return this.http.post<void>(`${environment.apiUrlPrefix}/${path}`, formDataZipFile, this.httpOptions);
  }

  syncModelRepoFleetManager(companyId: ID): void {
    const path = `companies/${companyId}/fleetmanager/synctomodelrepo`;
    this.http.put<SyncResult>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions).subscribe((syncResult) => {
      this.syncResult = syncResult;
      this.showResult = true;
    });
  }

  syncModelRepo(): void  {
    const path = this.getExportLinkEcosystemManager('GIT');
    this.http.put<SyncResult>(`${path}`, this.httpOptions).subscribe((syncResult) => {
      this.syncResult = syncResult;
      this.showResult = true;
    });
  }
}

class SyncResult {
  importResult: ProcessingResultDto;
  exportResult: ProcessingResultDto;

  constructor() {
    this.importResult = new ProcessingResultDto();
    this.exportResult = new ProcessingResultDto();
  }
}

class ProcessingResultDto {
  handled: number;
  skipped: number;

  constructor() {
    this.skipped = 0;
    this.handled = 0;
  }
}

enum ExportType {
  ZIP = 'ZIP',
  OWL = 'OWL',
  GIT = 'GIT'
}
