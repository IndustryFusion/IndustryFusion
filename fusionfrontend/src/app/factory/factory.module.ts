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
import { CompaniesPageComponent } from './components/pages/companies-page/companies-page.component';
import { CompanyPageComponent } from './components/pages/company-page/company-page.component';
import { FactorySitePageComponent } from './components/pages/factory-site-page/factory-site-page.component';
import { AssetPageComponent } from './components/pages/asset-page/asset-page.component';
import { AssetsGridPageComponent } from './components/pages/assets-grid-page/assets-grid-page.component';
import { AssetDetailsPageComponent } from './components/pages/asset-details-page/asset-details-page.component';
import { CompanyInfoComponent } from './components/content/company-info/company-info.component';
import { AssetsListComponent } from './components/content/assets-list/assets-list.component';
import { FusionFormatPipe } from '../pipes/fusionformat.pipe';
import { AssetCardComponent } from './components/content/asset-card/asset-card.component';
import { AssetDetailsHeaderComponent } from './components/content/asset-details/asset-details-header/asset-details-header.component';
import { MaintenanceBarComponent } from './components/content/asset-details/maintenance-bar/maintenance-bar.component';
import { AssetChartsComponent } from './components/content/asset-details/asset-charts/asset-charts.component';
import { CreateRoomComponent } from './components/content/create-room/create-room.component';
import { FactorySiteRoomsPageComponent } from './components/pages/factory-site-rooms-page/factory-site-rooms-page.component';
import { EditRoomComponent } from './components/content/edit-room/edit-room.component';
import { AssetTablesComponent } from './components/content/asset-details/asset-tables/asset-tables.component';
import { AssetsListPageComponent } from './components/pages/assets-list-page/assets-list-page.component';
import { FactoryPageTitleComponent } from './components/content/factory-page-title/factory-page-title.component';
import { FactorySubHeaderComponent } from './components/content/factory-sub-header/factory-sub-header.component';
import { PrecisionPipe } from '../pipes/precision.pipe';
import { StatusComponent } from './components/content/status/status.component';
import { ArraysortextendedPipe } from '../pipes/arraysortextended.pipe';
import { AssetsListItemComponent } from './components/content/assets-list/assets-list-item/assets-list-item.component';
import { AssetsListHeaderComponent } from './components/content/assets-list/assets-list-header/assets-list-header.component';
import { ArrayFilterPipe } from '../pipes/tablefilter.pipe';
import { ListFilterComponent } from './components/content/assets-list/list-filter/list-filter.component';
import { AssetInstantiationComponent } from './components/content/asset-instantiation/asset-instantiation.component';
import { AssetInstantiationStartModalComponent } from './components/content/asset-instantiation/asset-instantiation-start-modal/asset-instantiation-start-modal.component';
import { AssetInstantiationDescriptionModalComponent } from './components/content/asset-instantiation/asset-instantiation-description-modal/asset-instantiation-description-modal.component';
import { AssetInstantiationPairedModalComponent } from './components/content/asset-instantiation/asset-instantiation-paired-modal/asset-instantiation-paired-modal.component';
import { AssetInstantiationFactorySiteAssignmentModalComponent } from './components/content/asset-instantiation/asset-instantiation-factory-site-assignment-modal/asset-instantiation-factory-site-assignment-modal.component';
import { AssetInstantiationRoomAssignmentModalComponent } from './components/content/asset-instantiation/asset-instantiation-room-assignment-modal/asset-instantiation-room-assignment-modal.component';
import { FactorySiteDialogComponent } from './components/content/factory-site-dialog/factory-site-dialog.component';
import { IFCommon } from '../common/i-f-common.module';
import { FactorySitesComponent } from './components/content/factory-sites/factory-sites.component';
// tslint:disable-next-line:max-line-length
import { FactorySitesListItemComponent } from './components/content/factory-sites/factory-sites-list-item/factory-sites-list-item.component';
import { FactorySitesListHeaderComponent } from './components/content/factory-sites/factory-sites-list-header/factory-sites-list-header.component';

@NgModule({
  declarations: [
    CompaniesPageComponent,
    CompanyPageComponent,
    FactorySitePageComponent,
    AssetPageComponent,
    AssetsGridPageComponent,
    AssetsListPageComponent,
    AssetDetailsPageComponent,
    FactorySitesComponent,
    CompanyInfoComponent,
    AssetsListComponent,
    FusionFormatPipe,
    PrecisionPipe,
    ArraysortextendedPipe,
    ArrayFilterPipe,
    AssetCardComponent,
    AssetDetailsHeaderComponent,
    FactorySubHeaderComponent,
    FactoryPageTitleComponent,
    MaintenanceBarComponent,
    AssetChartsComponent,
    CreateRoomComponent,
    FactorySiteRoomsPageComponent,
    EditRoomComponent,
    AssetTablesComponent,
    StatusComponent,
    FactorySitesListHeaderComponent,
    FactorySitesListItemComponent,
    AssetsListItemComponent,
    AssetsListHeaderComponent,
    ListFilterComponent,
    AssetInstantiationComponent,
    AssetInstantiationStartModalComponent,
    AssetInstantiationDescriptionModalComponent,
    AssetInstantiationPairedModalComponent,
    AssetInstantiationFactorySiteAssignmentModalComponent,
    AssetInstantiationRoomAssignmentModalComponent,
    FactorySiteDialogComponent,
  ],
    imports: [
        IFCommon,
        FactoryRoutingModule,
        ClarityModule,
        ChartsModule,
        ReactiveFormsModule,
    ],
  exports: [
    FactorySubHeaderComponent,
    FactoryPageTitleComponent,
    ArraysortextendedPipe,
  ]
})
export class FactoryModule { }
