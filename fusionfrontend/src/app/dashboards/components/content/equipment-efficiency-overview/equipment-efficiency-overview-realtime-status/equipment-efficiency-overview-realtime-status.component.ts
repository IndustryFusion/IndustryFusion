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
import { combineLatest, forkJoin, Observable, timer } from 'rxjs';
import { Status } from '../../../../../factory/models/status.model';
import { switchMap } from 'rxjs/operators';
import { StatusService } from '../../../../../core/services/logic/status.service';
import { OispDeviceStatus } from '../../../../../core/models/kairos.model';
import { FactoryAssetDetailsWithFields } from '../../../../../core/store/factory-asset-details/factory-asset-details.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-equipment-efficiency-overview-realtime-status',
  templateUrl: './equipment-efficiency-overview-realtime-status.component.html',
  styleUrls: ['./equipment-efficiency-overview-realtime-status.component.scss']
})
export class EquipmentEfficiencyOverviewRealtimeStatusComponent implements OnInit {

  @Input()
  factoryAssetDetailsWithFields$: Observable<FactoryAssetDetailsWithFields[]>;

  public statusCounts: number[] = [0, 0, 0, 0];
  public OispDeviceStatus = OispDeviceStatus;

  private statuses$: Observable<Status[]>;

  constructor(private statusService: StatusService) {
  }

  ngOnInit(): void {
    this.statuses$ = combineLatest([this.factoryAssetDetailsWithFields$, timer(0, environment.dataUpdateIntervalMs)]).pipe(
      switchMap(([assetsWithFields, _]) =>
        forkJoin(assetsWithFields.map(assetWithFields => this.statusService.getStatusByAssetWithFields(assetWithFields, null)) )
      )
    );

    this.statuses$.subscribe((statuses: Status[]) => this.updateStatusCounts(statuses));
  }

  private updateStatusCounts(statuses: Status[]) {
    this.statusCounts = this.statusCounts.map(() => 0);

    statuses.forEach(status => {
      const deviceStatus = this.statusService.transformStatusToOispDeviceStatus(status);
      this.statusCounts[deviceStatus]++;
    });
  }

}
