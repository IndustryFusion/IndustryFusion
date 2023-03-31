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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ID } from '@datorama/akita';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { AssetTypeTemplate } from './asset-type-template.model';
import { AssetTypeTemplateStore } from './asset-type-template.store';
import { RestService } from '../../services/api/rest.service';

@Injectable({
  providedIn: 'root'
})
export class AssetTypeTemplateService implements RestService<AssetTypeTemplate> {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private assettypeTemplateStore: AssetTypeTemplateStore, private http: HttpClient) { }

  getItems(): Observable<AssetTypeTemplate[]> {
    const path = `assettypetemplates?embedChildren=true`;
    return this.http.get<AssetTypeTemplate[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entities => {
        this.assettypeTemplateStore.upsertMany(entities);
      }));
  }

  getItem(templateId: ID, embedChildren: boolean = false): Observable<AssetTypeTemplate> {
    const path = `assettypetemplates/${templateId}?embedChildren=${embedChildren}`;
    return this.http.get<AssetTypeTemplate>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions)
      .pipe(tap(entity => {
        this.assettypeTemplateStore.upsert(templateId, entity);
      }));
  }

  getNextPublishVersion(assetTypeId: ID): Observable<bigint> {
    const path = `assettypetemplates/nextVersion/${assetTypeId}`;
    return this.http.get<bigint>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }

  getExportLink(assetTypeId: ID, asOwl: boolean): string {
    const exportSubpath = asOwl ? `owlexport` : 'jsonexport';
    const path = `assettypetemplates/${assetTypeId}/${exportSubpath}`;
    return `${environment.apiUrlPrefix}${path}`;
  }

  createItem(template: AssetTypeTemplate): Observable<AssetTypeTemplate> {
    const path = `assettypetemplates`;
    return this.http.post<AssetTypeTemplate>(`${environment.apiUrlPrefix}/${path}`, template, this.httpOptions)
      .pipe(
        tap(entity => {
          this.assettypeTemplateStore.upsert(entity.id, entity);
        }));
  }

  createTemplate(template: AssetTypeTemplate, assetTypeId: ID): Observable<AssetTypeTemplate> {
    const path = `assettypetemplates`;
    return this.http.post<AssetTypeTemplate>(`${environment.apiUrlPrefix}/${path}`, template,
    { params: { assetTypeId: assetTypeId.toString()  }, ...this.httpOptions })
      .pipe(
        tap(entity => {
          this.assettypeTemplateStore.upsert(entity.id, entity);
        }));
  }

  editItem(templateId: ID, template: AssetTypeTemplate): Observable<AssetTypeTemplate> {
    const path = `assettypetemplates/${templateId}`;
    return this.http.patch<AssetTypeTemplate>(`${environment.apiUrlPrefix}/${path}`, template, this.httpOptions)
      .pipe(
        tap(entity => {
          this.assettypeTemplateStore.upsert(templateId, entity);
        }));
  }

  deleteItem(templateId: ID): Observable<any> {
    const path = `assettypetemplates/${templateId}`;
    return this.http.delete(`${environment.apiUrlPrefix}/${path}`)
      .pipe(tap({
        complete: () => {
          this.assettypeTemplateStore.remove(templateId);
        },
        error: (error) => {
          this.assettypeTemplateStore.setError(error);
        }
      }));
  }

  getSubsystemCandidates(assetTypeTemplateId: ID, assetTypeId: ID): Observable<AssetTypeTemplate[]> {
    const path = `assettypetemplates/${assetTypeTemplateId}/assettypes/${assetTypeId}/subsystemcandidates`;
    return this.http.get<AssetTypeTemplate[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }

  getPeerCandidates(assetTypeTemplateId: ID): Observable<AssetTypeTemplate[]> {
    const path = `assettypetemplates/${assetTypeTemplateId}/peercandidates`;
    return this.http.get<AssetTypeTemplate[]>(`${environment.apiUrlPrefix}/${path}`, this.httpOptions);
  }

  setActive(templateID: ID) {
    this.assettypeTemplateStore.setActive(templateID);
  }

}
