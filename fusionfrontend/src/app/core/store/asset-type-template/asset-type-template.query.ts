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
import { ID } from '@datorama/akita';
import { Observable } from 'rxjs';
import { BaseQueryEntity } from '../basequery';
import { AssetTypeTemplate } from './asset-type-template.model';
import { AssetTypeTemplateState, AssetTypeTemplateStore } from './asset-type-template.store';
import { NameWithVersionPipe } from '../../../shared/pipes/namewithversion.pipe';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AssetTypeTemplateQuery extends BaseQueryEntity<AssetTypeTemplateState, AssetTypeTemplate> {

  constructor(protected store: AssetTypeTemplateStore,
              private nameWithVersionPipe: NameWithVersionPipe) {
    super(store);
  }

  selectAssetTypeTemplates(): Observable<AssetTypeTemplate[]> {
    return this.selectAll();
  }

  selectAssetTypeTemplate(templateId: ID): Observable<AssetTypeTemplate> {
    return this.selectEntity(templateId);
  }

  resetStore() {
    this.store.reset();
  }

  resetError() {
    this.store.setError(null);
  }

  selectSubtitleName(entity: any): Observable<string> {
    return this.selectEntity(entity.id).pipe(
      map((item => this.nameWithVersionPipe.transform(item.name, item.publishedVersion)))
    );
  }
}
