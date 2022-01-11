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
import { Resolve } from '@angular/router';
import { AssetQuery } from '../store/asset/asset.query';
import { Asset } from '../store/asset/asset.model';
import { Observable } from 'rxjs';
import { FieldInstanceService } from '../store/field-instance/field-instance.service';
import { FieldInstance } from '../store/field-instance/field-instance.model';

@Injectable({ providedIn: 'root' })
export class FieldInstanceResolver implements Resolve<void> {
  constructor(private fieldInstanceService: FieldInstanceService,
              private assetQuery: AssetQuery) {
  }

  resolve(): void { // using Observable will (probably) result in deadlock when called from routing module
    this.assetQuery.waitForActive().subscribe(asset => {
      this.resolveOfAsset(asset).subscribe();
    });
  }

  resolveOfAsset(asset: Asset): Observable<FieldInstance[]> {
      return this.fieldInstanceService.getFieldInstances(asset.companyId, asset.id);
  }
}
