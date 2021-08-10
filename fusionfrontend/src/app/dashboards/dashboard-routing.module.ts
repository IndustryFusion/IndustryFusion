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
import { DashboardPageType } from './dashboard-routing.model';
import { EquipmentEfficiencyPageComponent } from './components/pages/equipment-efficiency-page/equipment-efficiency-page.component';

const routes: Routes = [
  {
    path: 'dashboards/companies/:companyId/maintenance',
    component: MaintenancePageComponent,
    data: {
      pageTypes: [DashboardPageType.MAINTENANCE]
    }
  },
  {
    path: 'dashboards/companies/:companyId/equipmentEfficiency',
    component: EquipmentEfficiencyPageComponent,
    data: {
      pageTypes: [DashboardPageType.EQUIPMENT_EFFICIENCY]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
