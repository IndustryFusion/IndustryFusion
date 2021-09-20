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

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { AgmCoreModule } from '@agm/core';
import { ChartsModule } from 'ng2-charts';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardSubHeaderComponent } from './components/content/dashboard-sub-header/dashboard-sub-header.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { environment } from 'src/environments/environment';
import { MaintenancePageComponent } from 'src/app/dashboards/components/pages/maintenance-page/maintenance-page.component';
import { MaintenanceListComponent } from './components/content/maintenance-list/maintenance-list.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { IFCommon } from '../common/i-f-common.module';
import { MaintenanceAssetSortPipe } from '../pipes/maintenance-asset-sort.pipe';
import { EquipmentEfficiencyPageComponent } from './components/pages/equipment-efficiency-page/equipment-efficiency-page.component';
import { EquipmentEfficiencyListComponent } from './components/content/equipment-efficiency-list/equipment-efficiency-list.component';
import { EquipmentEfficiencyBarChartComponent } from './components/content/equipment-efficiency-list/equipment-efficiency-bar-chart/equipment-efficiency-bar-chart.component';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { TreeTableModule } from 'primeng/treetable';
import { TreeModule } from 'primeng/tree';

@NgModule({
  declarations: [
    DashboardSubHeaderComponent,
    MaintenancePageComponent,
    MaintenanceListComponent,
    MaintenanceAssetSortPipe,
    MaintenanceAssetSortPipe,
    EquipmentEfficiencyPageComponent,
    EquipmentEfficiencyListComponent,
    EquipmentEfficiencyBarChartComponent,
  ],
  imports: [
    IFCommon,
    DashboardRoutingModule,
    ClarityModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapsClientId
    }),
    ChartsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    OverlayPanelModule,
    TableModule,
    CalendarModule,
    ChartModule,
    TableModule,
    TreeTableModule,
    TreeModule,
  ],
  exports: [
    DashboardSubHeaderComponent,
  ]
})
export class DashboardModule {
}
