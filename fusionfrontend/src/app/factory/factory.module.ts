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
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { AgmCoreModule } from '@agm/core';
import { ChartsModule } from 'ng2-charts';

import { FactoryRoutingModule } from './factory-routing.module';
import { CompaniesPageComponent } from './components/pages/companies-page/companies-page.component';
import { CompanyPageComponent } from './components/pages/company-page/company-page.component';
import { LocationPageComponent } from './components/pages/location-page/location-page.component';
import { AssetPageComponent } from './components/pages/asset-page/asset-page.component';
import { AssetsGridPageComponent } from './components/pages/assets-grid-page/assets-grid-page.component';
import { AssetDetailsPageComponent } from './components/pages/asset-details-page/asset-details-page.component';
import { LocationsMapComponent } from './components/content/locations-map/locations-map.component';
import { LocationsComponent } from './components/content/locations/locations.component';
import { CompanyInfoComponent } from './components/content/company-info/company-info.component';
import { AssetsListComponent } from './components/content/assets-list/assets-list.component';
import { FusionFormatPipe } from '../pipes/fusionformat.pipe';
import { AssetCardComponent } from './components/content/asset-card/asset-card.component';
import { AssetDetailsHeaderComponent } from './components/content/asset-details/asset-details-header/asset-details-header.component';
import { MaintenanceBarComponent } from './components/content/asset-details/maintenance-bar/maintenance-bar.component';
import { AssetChartsComponent } from './components/content/asset-details/asset-charts/asset-charts.component';
import { CreateRoomComponent } from './components/content/create-room/create-room.component';
import { RoomsPageComponent } from './components/pages/rooms-page/rooms-page.component';
import { EditRoomComponent } from './components/content/edit-room/edit-room.component';
import { AssetTablesComponent } from './components/content/asset-details/asset-tables/asset-tables.component';
import { AssetsListPageComponent } from './components/pages/assets-list-page/assets-list-page.component';
import { FactoryPageTitleComponent } from './components/content/factory-page-title/factory-page-title.component';
import { FactorySubHeaderComponent } from './components/content/factory-sub-header/factory-sub-header.component';
import { PrecisionPipe } from '../pipes/precision.pipe';
import { StatusComponent } from './components/content/status/status.component';
import { LocationsListHeaderComponent } from './components/content/locations/locations-list-header/locations-list-header.component';
import { LocationsListItemComponent } from './components/content/locations/locations-list-item/locations-list-item.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ArraysortextendedPipe } from '../pipes/arraysortextended.pipe';
import { AssetsListItemComponent } from './components/content/assets-list/assets-list-item/assets-list-item.component';
import { AssetsListHeaderComponent } from './components/content/assets-list/assets-list-header/assets-list-header.component';
import { ArrayFilterPipe } from '../pipes/tablefilter.pipe';
import { ListFilterComponent } from './components/content/assets-list/list-filter/list-filter.component';
import { environment } from 'src/environments/environment';
import { AssetInstantiationComponent } from './components/content/asset-instantiation/asset-instantiation.component';
import { AssetInstantiationStartModalComponent } from './components/content/asset-instantiation/asset-instantiation-start-modal/asset-instantiation-start-modal.component';
import { AssetInstantiationDescriptionModalComponent } from './components/content/asset-instantiation/asset-instantiation-description-modal/asset-instantiation-description-modal.component';
import { AssetInstantiationPairedModalComponent } from './components/content/asset-instantiation/asset-instantiation-paired-modal/asset-instantiation-paired-modal.component';
import { AssetInstantiationLocationAssignmentModalComponent } from './components/content/asset-instantiation/asset-instantiation-location-assignment-modal/asset-instantiation-location-assignment-modal.component';
import { AssetInstantiationRoomAssignmentModalComponent } from './components/content/asset-instantiation/asset-instantiation-room-assignment-modal/asset-instantiation-room-assignment-modal.component';
import { LocationDialogComponent } from './components/content/location-dialog/location-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { InputTextModule } from 'primeng/inputtext';
import { EcosystemModule } from '../ecosystem/ecosystem.module';
import { IFCommon } from '../common/i-f-common.module';

@NgModule({
  declarations: [
    CompaniesPageComponent,
    CompanyPageComponent,
    LocationPageComponent,
    AssetPageComponent,
    AssetsGridPageComponent,
    AssetsListPageComponent,
    AssetDetailsPageComponent,
    LocationsMapComponent,
    LocationsComponent,
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
    RoomsPageComponent,
    EditRoomComponent,
    AssetTablesComponent,
    StatusComponent,
    LocationsListHeaderComponent,
    LocationsListItemComponent,
    AssetsListItemComponent,
    AssetsListHeaderComponent,
    ListFilterComponent,
    AssetInstantiationComponent,
    AssetInstantiationStartModalComponent,
    AssetInstantiationDescriptionModalComponent,
    AssetInstantiationPairedModalComponent,
    AssetInstantiationLocationAssignmentModalComponent,
    AssetInstantiationRoomAssignmentModalComponent,
    LocationDialogComponent,
  ],
    imports: [
        IFCommon,
        CommonModule,
        FactoryRoutingModule,
        ClarityModule,
        AgmCoreModule.forRoot({
            apiKey: environment.googleMapsClientId
        }),
        ChartsModule,
        FormsModule,
        FontAwesomeModule,
        ReactiveFormsModule,
        DialogModule,
        DropdownModule,
        ButtonModule,
        MenuModule,
        InputTextModule,
        EcosystemModule,
    ],
  exports: [
    FactorySubHeaderComponent,
    FactoryPageTitleComponent,
    ArraysortextendedPipe,
  ]
})
export class FactoryModule { }
