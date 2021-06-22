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
import { FleetManagerPageComponentComponent } from './components/pages/fleet-manager-page-component/fleet-manager-page-component.component';
import { AssetSeriesPageComponent } from './components/pages/asset-series-page/asset-series-page.component';
import { AssetSeriesDetailsResolver } from '../resolvers/asset-series-details-resolver.service';
import { AssetSeriesListComponent } from './components/content/asset-series-list/asset-series-list.component';
import { AssetSeriesResolver } from '../resolvers/asset-series.resolver';
import { MainAuthGuardGuard } from '../services/main-auth-guard.guard';
import { AssetSeriePageComponent } from './components/pages/asset-serie-page/asset-serie-page.component';
import { AssetResolver } from '../resolvers/asset.resolver';
import { RoomResolver } from '../resolvers/room.resolver';
import { LocationResolver } from '../resolvers/location.resolver';


const routes: Routes = [
  {
    path: 'fleetmanager/template',
    component: FleetManagerPageComponentComponent,
  },
  {
    path: 'fleetmanager/companies/:companyId/assetseries',
    component: AssetSeriesPageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      assetSeriesDetails: AssetSeriesDetailsResolver,
    },
    children: [
      {
      path: '',
      component: AssetSeriesListComponent,
    },
      {
        path: ':assetSeriesId',
        component: AssetSeriePageComponent,
        resolve: {
          assetSeries: AssetSeriesResolver,
          asset: AssetResolver,
          room: RoomResolver,
          location: LocationResolver
        }
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FleetRoutingModule { }
