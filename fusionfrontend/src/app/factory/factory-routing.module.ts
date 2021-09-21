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
import { FactorySitesPageComponent } from './components/pages/factory-sites-page/factory-sites-page.component';
import { FactorySitePageComponent } from './components/pages/factory-site-page/factory-site-page.component';
import { AssetsGridPageComponent } from './components/pages/assets-grid-page/assets-grid-page.component';
import { RoomsPageComponent } from './components/pages/rooms-page/rooms-page.component';
import { AssetsListPageComponent } from './components/pages/assets-list-page/assets-list-page.component';
import { FactoryManagerPageType } from './factory-routing.model';
import { MainAuthGuardGuard } from '../services/main-auth-guard.guard';
import { Role } from '../services/roles.model';
import { AssetPerformanceComponent } from './components/pages/asset-details/asset-performance/asset-performance.component';
import { AssetDigitalNameplateComponent } from './components/pages/asset-details/asset-digital-nameplate/asset-digital-nameplate.component';
import { AssetSubsystemsComponent } from './components/pages/asset-details/asset-subsystems/asset-subsystems.component';
import { FactoryAssetDetailsResolver } from '../resolvers/factory-asset-details.resolver';
import { OispDeviceResolver } from '../resolvers/oisp-device-resolver';
import { AssetAppletsComponent } from './components/pages/asset-details/asset-applets/asset-applets.component';
import { AssetNotificationsComponent } from './components/pages/asset-details/asset-notifications/asset-notifications.component';
import { OispRuleFilteredByStatusResolver } from '../resolvers/oisp-rule-filtered-by-status-resolver.service';
import { FactorySiteQuery } from '../store/factory-site/factory-site.query';
import { FactorySitesComponent } from './components/content/factory-sites/factory-sites.component';
import { RoomQuery } from '../store/room/room.query';
import { RoomsListComponent } from './components/content/rooms-list/rooms-list.component';

const routes: Routes = [
  {
    path: 'factorymanager/companies/:companyId',
    canActivate: [MainAuthGuardGuard],
    children: [
      {
        path: '',
        redirectTo: 'factorysites',
        pathMatch: 'full'
      },
      {
        path: 'factorysites',
        component: FactorySitesPageComponent,
        data: {
          pageTypes: [FactoryManagerPageType.COMPANY_DETAIL, FactoryManagerPageType.FACTORY_SITE_LIST],
          roles: [Role.FACTORY_MANAGER],
          breadcrumb: 'Factory Sites'
        },
        children: [
          {
            path: '',
            component: FactorySitesComponent,
            pathMatch: 'full',
            data: {
              breadcrumb: null
            }
          },
          {
            path: ':factorySiteId',
            component: FactorySitePageComponent,
            data: {
              pageTypes: [FactoryManagerPageType.FACTORY_SITE_DETAIL, FactoryManagerPageType.ASSET_LIST],
              roles: [Role.FACTORY_MANAGER],
              breadcrumb: FactorySiteQuery
            }
          },
        ]
      }
    ]
  },

  {
    path: 'factorymanager/companies/:companyId/rooms',
    component: RoomsPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.FACTORY_SITE_DETAIL, FactoryManagerPageType.ROOM_LIST],
      roles: [Role.FACTORY_MANAGER],
      breadcrumb: 'Rooms'
    },
    children: [
      {
        path: '',
        component: RoomsListComponent,
        pathMatch: 'full',
        data: {
          breadcrumb: null
        }
      },
      {
        path: ':roomId',
        component: AssetsListPageComponent,
        canActivate: [MainAuthGuardGuard],
        data: {
          pageTypes: [FactoryManagerPageType.FACTORY_SITE_DETAIL, FactoryManagerPageType.ROOM_LIST],
          roles: [Role.FACTORY_MANAGER],
          breadcrumb: RoomQuery
        }
      },
    ]
  },

  {
    path: 'factorymanager/companies/:companyId/assets',
    component: AssetsListPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/factorysites/:factorySiteId/rooms/:roomId/asset-cards/:assetIdList',
    component: AssetsGridPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.FACTORY_SITE_DETAIL, FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/factorysites/:factorySiteId/assets',
    component: AssetsGridPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.FACTORY_SITE_DETAIL, FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/factorysites/:factorySiteId/asset-cards/:assetIdList',
    component: AssetsGridPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.FACTORY_SITE_DETAIL, FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/asset-cards/:assetIdList',
    component: AssetsGridPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/assets/rooms/:roomId/asset-cards/:assetIdList',
    component: AssetsGridPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.FACTORY_SITE_DETAIL, FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/assets/:assetId',
    canActivate: [MainAuthGuardGuard],
    resolve: { assets: FactoryAssetDetailsResolver, OispDeviceResolver },
    data: {
      pageTypes: [FactoryManagerPageType.FACTORY_SITE_DETAIL, FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    },
    children: [
      {
        path: '',
        redirectTo: 'performance',
        pathMatch: 'full',
      },
      {
        path: 'performance',
        component: AssetPerformanceComponent,
      },
      {
        path: 'applets/active',
        component: AssetAppletsComponent,
        resolve: { rules: OispRuleFilteredByStatusResolver }
      },
      {
        path: 'applets/archiv',
        component: AssetAppletsComponent,
        resolve: { rules: OispRuleFilteredByStatusResolver }
      },
      {
        path: 'digital-nameplate',
        component: AssetDigitalNameplateComponent,
      },
      {
        path: 'subsystems',
        component: AssetSubsystemsComponent,
      },
      {
        path: 'notifications',
        component: AssetNotificationsComponent,
      },
      {
        path: 'notifications/:state',
        component: AssetNotificationsComponent,
      },
    ]
  },
  {
    path: 'factorymanager/companies/:companyId/assets/asset-cards/:assetIdList',
    component: AssetsGridPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.FACTORY_SITE_DETAIL, FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FactoryRoutingModule {
}
