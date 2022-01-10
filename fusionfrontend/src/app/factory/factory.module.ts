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
import { ChartsModule } from 'ng2-charts';

import { FactoryRoutingModule } from './factory-routing.module';
import { FactorySitesPageComponent } from './components/pages/factory-sites-page/factory-sites-page.component';
import { FactorySitePageComponent } from './components/pages/factory-site-page/factory-site-page.component';
import { AssetsGridPageComponent } from './components/pages/assets-grid-page/assets-grid-page.component';
import { CompanyInfoComponent } from './components/content/company-info/company-info.component';
import { AssetsListComponent } from './components/content/assets-list/assets-list.component';
import { AssetStatusPipe } from '../shared/pipes/asset-status-pipe';
import { AssetDigitalNameplateComponent } from './components/pages/asset-details/asset-digital-nameplate/asset-digital-nameplate.component';
import { AssetDetailsInfoComponent } from './components/content/asset-details/asset-details-info/asset-details-info.component';
import { AssetChartsComponent } from './components/content/asset-details/asset-charts/asset-charts.component';
import { RoomDialogComponent } from './components/content/room-dialog/room-dialog.component';
import { RoomsPageComponent } from './components/pages/rooms-page/rooms-page.component';
import { AssetTablesComponent } from './components/content/asset-details/asset-tables/asset-tables.component';
import { AssetsListPageComponent } from './components/pages/assets-list-page/assets-list-page.component';
import { FactoryPageTitleComponent } from './components/content/factory-page-title/factory-page-title.component';
import { FactorySubHeaderComponent } from './components/content/factory-sub-header/factory-sub-header.component';
import { PrecisionPipe } from '../shared/pipes/precision.pipe';
import { AssetStatusComponent } from './components/content/asset-status/asset-status.component';
import { ArraysortextendedPipe } from '../shared/pipes/arraysortextended.pipe';
import { ArrayFilterPipe } from '../shared/pipes/tablefilter.pipe';
import { AssetInstantiationComponent } from './components/content/asset-instantiation/asset-instantiation.component';
import { AssetInstantiationStartModalComponent } from './components/content/asset-instantiation/asset-instantiation-start-modal/asset-instantiation-start-modal.component';
import { AssetInstantiationDescriptionModalComponent } from './components/content/asset-instantiation/asset-instantiation-description-modal/asset-instantiation-description-modal.component';
import { AssetInstantiationPairedModalComponent } from './components/content/asset-instantiation/asset-instantiation-paired-modal/asset-instantiation-paired-modal.component';
import { AssetInstantiationFactorySiteAssignmentModalComponent } from './components/content/asset-instantiation/asset-instantiation-factory-site-assignment-modal/asset-instantiation-factory-site-assignment-modal.component';
import { AssetInstantiationRoomAssignmentModalComponent } from './components/content/asset-instantiation/asset-instantiation-room-assignment-modal/asset-instantiation-room-assignment-modal.component';
import { FactorySiteDialogComponent } from './components/content/factory-site-dialog/factory-site-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { FactorySitesComponent } from './components/content/factory-sites/factory-sites.component';
// tslint:disable-next-line:max-line-length
import { TableModule } from 'primeng/table';
import { RoomsListComponent } from './components/content/rooms-list/rooms-list.component';
import { AssignAssetToRoomComponent } from './components/content/assign-asset-to-room/assign-asset-to-room.component';
import { AssetDetailsSubHeaderComponent } from './components/content/asset-details/asset-details-sub-header/asset-details-sub-header.component';
import { AssetRealtimeViewComponent } from './components/pages/asset-details/asset-performance/asset-realtime-view/asset-realtime-view.component';
import { AssetCardComponent } from './components/content/asset-card/asset-card.component';
import { CardModule } from 'primeng/card';
import { AssetSubsystemsComponent } from './components/pages/asset-details/asset-subsystems/asset-subsystems.component';
import { AssetAppletsComponent } from './components/pages/asset-details/asset-applets/asset-applets.component';
import { FusionAppletsModule } from '../fusion-applets/fusion-applets.module';
import { AssetNotificationsComponent } from './components/pages/asset-details/asset-notifications/asset-notifications.component';
import { AccordionModule } from 'primeng/accordion';
import { AssetPerformanceComponent } from './components/pages/asset-details/asset-performance/asset-performance.component';
import { AssetPerformanceViewComponent } from './components/pages/asset-details/asset-performance/asset-performance-view/asset-performance-view.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DashboardModule } from '../dashboards/dashboard.module';
import { AssetHistoricalViewComponent } from './components/pages/asset-details/asset-performance/asset-historical-view/asset-historical-view.component';
import { CalendarModule } from 'primeng/calendar';
import { TreeTableModule } from 'primeng/treetable';
import { TreeModule } from 'primeng/tree';
import { HistoricalStatusBarChartComponent } from '../shared/components/content/historical-status-bar-chart/historical-status-bar-chart.component';
import { ChartModule } from 'primeng/chart';
import { MetricsBoardComponent } from './components/content/metrics-board/metrics-board.component';
import { MetricsGroupComponent } from './components/content/metrics-board/metrics-group/metrics-group.component';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    FactorySitesPageComponent,
    FactorySitePageComponent,
    AssetsGridPageComponent,
    AssetsListPageComponent,
    AssetPerformanceComponent,
    AssetHistoricalViewComponent,
    AssetRealtimeViewComponent,
    AssetPerformanceViewComponent,
    FactorySitesComponent,
    CompanyInfoComponent,
    AssetsListComponent,
    AssetStatusPipe,
    PrecisionPipe,
    ArraysortextendedPipe,
    ArrayFilterPipe,
    AssetDigitalNameplateComponent,
    AssetDetailsInfoComponent,
    FactorySubHeaderComponent,
    FactoryPageTitleComponent,
    AssetChartsComponent,
    RoomDialogComponent,
    RoomsPageComponent,
    AssetTablesComponent,
    AssetStatusComponent,
    AssetInstantiationComponent,
    AssetInstantiationStartModalComponent,
    AssetInstantiationDescriptionModalComponent,
    AssetInstantiationPairedModalComponent,
    AssetInstantiationFactorySiteAssignmentModalComponent,
    AssetInstantiationRoomAssignmentModalComponent,
    FactorySiteDialogComponent,
    RoomsListComponent,
    AssignAssetToRoomComponent,
    AssetDetailsSubHeaderComponent,
    AssetCardComponent,
    AssetSubsystemsComponent,
    AssetAppletsComponent,
    AssetNotificationsComponent,
    HistoricalStatusBarChartComponent,
    MetricsBoardComponent,
    MetricsGroupComponent,
  ],
    imports: [
        SharedModule,
        FactoryRoutingModule,
        ClarityModule,
        ChartsModule,
        ReactiveFormsModule,
        TableModule,
        CardModule,
        FusionAppletsModule,
        AccordionModule,
        SelectButtonModule,
        DashboardModule,
        CalendarModule,
        ChartModule,
        TreeTableModule,
        TreeModule,
        TooltipModule,
    ],
  exports: [
    FactorySubHeaderComponent,
    FactoryPageTitleComponent,
    ArraysortextendedPipe,
    AssetDetailsSubHeaderComponent,
  ]
})
export class FactoryModule {
}
