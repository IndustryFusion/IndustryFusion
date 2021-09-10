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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StatusService } from '../../../../services/status.service';
import { FactoryAssetDetailsWithFields } from '../../../../store/factory-asset-details/factory-asset-details.model';
import { combineLatest, forkJoin, Observable, timer } from 'rxjs';
import { Status } from '../../../../factory/models/status.model';
import { switchMap } from 'rxjs/operators';
import { EquipmentEfficiencyBarChartComponent } from '../equipment-efficiency-list/equipment-efficiency-bar-chart/equipment-efficiency-bar-chart.component';
import { OispDeviceStatus } from '../../../../services/kairos.model';

@Component({
  selector: 'app-equipment-efficiency-overview',
  templateUrl: './equipment-efficiency-overview.component.html',
  styleUrls: ['./equipment-efficiency-overview.component.scss']
})
export class EquipmentEfficiencyOverviewComponent implements OnInit {

  @Input()
  factoryAssetDetailsWithFields$: Observable<FactoryAssetDetailsWithFields[]>;

  @Input()
  date: Date;

  @Output()
  dateChanged = new EventEmitter<Date>();

  public statusCounts: number[] = [0, 0, 0, 0];
  public OispDeviceStatus = OispDeviceStatus;

  private stati$: Observable<Status[]>;


  constructor(private statusService: StatusService) { }

  ngOnInit(): void {
    this.stati$ = combineLatest([this.factoryAssetDetailsWithFields$, timer(0, 5000)]).pipe(
      switchMap(([assetsWithFields, _]) =>
       forkJoin(assetsWithFields.map(assetWithFields => this.statusService.getStatusByAssetWithFields(assetWithFields, null)) )
      )
    );

    this.stati$.subscribe((stati: Status[]) => this.updateStatusCounts(stati));
  }

  private updateStatusCounts(stati: Status[]) {
    this.statusCounts = this.statusCounts.map(() => 0);

    stati.forEach(status => {
      const deviceStatus = this.statusService.transformStatusToOispDeviceStatus(status);
      this.statusCounts[EquipmentEfficiencyBarChartComponent.getDatasetIndexFromStatus(deviceStatus)]++;
    });
  }

}
