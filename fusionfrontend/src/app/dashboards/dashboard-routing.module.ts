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
import { RouterModule, Routes } from '@angular/router';
import { MaintenancePageComponent } from './components/pages/maintenance-page/maintenance-page.component';
import { EquipmentEfficiencyPageComponent } from './components/pages/equipment-efficiency-page/equipment-efficiency-page.component';
import { OispDeviceResolver } from '../resolvers/oisp-device-resolver';

const routes: Routes = [
  {
    path: 'dashboards/companies/:companyId/maintenance',
    component: MaintenancePageComponent,
    resolve: {
      devices: OispDeviceResolver
    },
    data: {
      breadcrumb: 'Maintenance'
    }
  },
  {
    path: 'dashboards/companies/:companyId/equipment-efficiency',
    component: EquipmentEfficiencyPageComponent,
    data: {
      breadcrumb: 'Equipment Efficiency'
    },
    resolve: {
      devices: OispDeviceResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
