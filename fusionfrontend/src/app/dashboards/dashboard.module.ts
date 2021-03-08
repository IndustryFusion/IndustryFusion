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

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPageTitleComponent } from './components/content/dashboard-page-title/dashboard-page-title.component';
import { DashboardSubHeaderComponent } from './components/content/dashboard-sub-header/dashboard-sub-header.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { environment } from 'src/environments/environment';
import { MaintenancePageComponent } from 'src/app/dashboards/components/pages/maintenance-page/maintenance-page.component';
import { MaintenanceListComponent } from './components/content/maintenance-list/maintenance-list.component';
import { MaintenanceListHeaderComponent } from './components/content/maintenance-list/maintenance-list-header/maintenance-list-header.component';
import { MaintenanceListItemComponent } from './components/content/maintenance-list/maintenance-list-item/maintenance-list-item.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext'


@NgModule({
  declarations: [
    DashboardPageTitleComponent,
    DashboardSubHeaderComponent,
    MaintenancePageComponent,
    MaintenanceListComponent,
    MaintenanceListHeaderComponent,
    MaintenanceListItemComponent
  ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        ClarityModule,
        AgmCoreModule.forRoot({
            apiKey: environment.googleMapsClientId
        }),
        ChartsModule,
        FormsModule,
        FontAwesomeModule,
        ReactiveFormsModule,
        ProgressBarModule,
        DialogModule,
        InputTextModule
      ],
  exports: [
    DashboardSubHeaderComponent,
    DashboardPageTitleComponent,
  ]
})
export class DashboardModule { }
