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


import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusService } from 'src/app/core/services/logic/status.service';
import { Status } from '../../../models/status.model';
import { FactoryAssetDetailsWithFields } from '../../../../core/store/factory-asset-details/factory-asset-details.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-asset-status',
  templateUrl: './asset-status.component.html',
  styleUrls: ['./asset-status.component.scss']
})
export class AssetStatusComponent implements OnInit {

  @Input()
  assetWithFields: FactoryAssetDetailsWithFields;

  @Input()
  showInline: boolean;

  status$: Observable<Status>;

  constructor(private statusService: StatusService) {
  }

  ngOnInit(): void {
   this.status$ = this.statusService.getStatusByAssetWithFields(this.assetWithFields, environment.dataUpdateIntervalMs);
  }
}
