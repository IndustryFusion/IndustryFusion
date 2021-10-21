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
import { AssetSeriesPageComponent } from './components/pages/asset-series-page/asset-series-page.component';
import { AssetSeriesDetailsResolver } from '../resolvers/asset-series-details-resolver.service';
import { AssetSeriesListComponent } from './components/content/asset-series-list/asset-series-list.component';
import { MainAuthGuard } from '../services/main-auth-guard.service';
import { AssetSeriesOverviewPageComponent } from './components/pages/asset-series-overview-page/asset-series-overview-page.component';
import { AssetResolver } from '../resolvers/asset.resolver';
import { RoomResolver } from '../resolvers/room.resolver';
import { FactorySiteResolver } from '../resolvers/factory-site-resolver.service';
import { AssetSeriesDetailsQuery } from '../store/asset-series-details/asset-series-details.query';
import { AssetSeriesDigitalNameplateComponent } from './components/pages/asset-series-instance/asset-series-digital-nameplate/asset-series-digital-nameplate.component';
import { FactoryAssetDetailsResolver } from '../resolvers/factory-asset-details.resolver';
import { FactoryAssetDetailsQuery } from '../store/factory-asset-details/factory-asset-details.query';


const routes: Routes = [
  {
    path: 'fleetmanager/companies/:companyId/assetseries',
    component: AssetSeriesPageComponent,
    canActivate: [MainAuthGuard],
    data: {
      breadcrumb: 'Asset Series',
    },
    resolve: {
      assetSeriesDetails: AssetSeriesDetailsResolver,
    },
    children: [
      {
        path: '',
        component: AssetSeriesListComponent,
        data: {
          breadcrumb: null,
        },
      },
      {
        path: ':assetSeriesId',
        data: {
          breadcrumb: null,
        },
        resolve: {
          asset: AssetResolver,
          room: RoomResolver,
          factorySite: FactorySiteResolver
        },
        children: [
          {
            path: 'assets',
            data: {
              breadcrumb: AssetSeriesDetailsQuery,
            },
            children: [
              {
                path: '',
                component: AssetSeriesOverviewPageComponent,
                data: {
                  breadcrumb: null,
                },
              },
              {
                path: ':assetId/digital-nameplate',
                component: AssetSeriesDigitalNameplateComponent,
                resolve: {
                  asset: FactoryAssetDetailsResolver,
                  room: RoomResolver,
                  factorySite: FactorySiteResolver,
                },
                data: {
                  breadcrumb: FactoryAssetDetailsQuery
                }
              }
            ]
          },
        ]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FleetRoutingModule {
}
