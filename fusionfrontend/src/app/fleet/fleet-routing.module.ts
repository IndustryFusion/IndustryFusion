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
import { AssetSeriesDetailsResolver } from '../core/resolvers/asset-series-details.resolver';
import { AssetSeriesListComponent } from './components/content/asset-series-list/asset-series-list.component';
import { MainAuthGuard } from '../core/guards/main-auth.guard';
import { AssetSeriesOverviewPageComponent } from './components/pages/asset-series-overview-page/asset-series-overview-page.component';
import { AssetResolver } from '../core/resolvers/asset.resolver';
import { RoomResolver } from '../core/resolvers/room.resolver';
import { FactorySiteResolver } from '../core/resolvers/factory-site.resolver';
import { AssetSeriesDetailsQuery } from '../core/store/asset-series-details/asset-series-details.query';
import {
  AssetSeriesAssetDigitalNameplateComponent
} from './components/pages/asset-series-asset/asset-series-asset-digital-nameplate/asset-series-asset-digital-nameplate.component';
import { FleetAssetDetailsResolver } from '../core/resolvers/fleet-asset-details.resolver';
import { FleetAssetDetailsQuery } from '../core/store/fleet-asset-details/fleet-asset-details.query';
import { AssetSeriesResolver } from '../core/resolvers/asset-series.resolver';
import { ConnectivityTypeResolver } from '../core/resolvers/connectivity-type.resolver';
import { CompanyResolver } from '../core/resolvers/company.resolver';
import { AssetTypeTemplatesResolver } from '../core/resolvers/asset-type-templates.resolver';
import { FleetManagerBreadCrumbs } from './fleet-routing.model';


const routes: Routes = [
  {
    path: 'fleetmanager/companies/:companyId/assetseries',
    component: AssetSeriesPageComponent,
    canActivate: [MainAuthGuard],
    data: {
      breadcrumb: FleetManagerBreadCrumbs.ASSET_SERIES,
    },
    resolve: {
      company: CompanyResolver,
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
          assetTypeTemplates: AssetTypeTemplatesResolver,
        },
        children: [
          {
            path: 'assets',
            data: {
              breadcrumb: AssetSeriesDetailsQuery,
            },
            resolve: {
              factorySite: FactorySiteResolver
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
                component: AssetSeriesAssetDigitalNameplateComponent,
                resolve: {
                  asset: FleetAssetDetailsResolver,
                  assetSeries: AssetSeriesResolver,
                  connectivityTypes: ConnectivityTypeResolver
                },
                data: {
                  breadcrumb: FleetAssetDetailsQuery
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
