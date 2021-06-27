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
import { CompaniesPageComponent } from './components/pages/companies-page/companies-page.component';
import { CompanyPageComponent } from './components/pages/company-page/company-page.component';
import { LocationPageComponent } from './components/pages/location-page/location-page.component';
import { AssetPageComponent } from './components/pages/asset-page/asset-page.component';
import { AssetsGridPageComponent } from './components/pages/assets-grid-page/assets-grid-page.component';
import { AssetDetailsPageComponent } from './components/pages/asset-details-page/asset-details-page.component';
import { RoomsPageComponent } from './components/pages/rooms-page/rooms-page.component';
import { AssetsListPageComponent } from './components/pages/assets-list-page/assets-list-page.component';
import { FactoryManagerPageType } from './factory-routing.model';
import { MainAuthGuardGuard } from '../services/main-auth-guard.guard';
import { Role } from '../services/roles.model';

const routes: Routes = [
  {
    path: 'factorymanager/companies',
    component: CompaniesPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.COMPANY_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId',
    component: CompanyPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.COMPANY_DETAIL, FactoryManagerPageType.LOCATION_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/locations/:locationId',
    component: LocationPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.LOCATION_DETAIL, FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
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
    path: 'factorymanager/companies/:companyId/assets/rooms',
    component: RoomsPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.LOCATION_DETAIL, FactoryManagerPageType.ROOM_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/locations/:locationId/rooms',
    component: RoomsPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.LOCATION_DETAIL, FactoryManagerPageType.ROOM_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/locations/:locationId/rooms/:roomId',
    component: AssetsListPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.LOCATION_DETAIL, FactoryManagerPageType.ROOM_DETAIL, FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/locations/:locationId/rooms/:roomId/asset-cards/:assetIdList',
    component: AssetsGridPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.LOCATION_DETAIL, FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/locations/:locationId/rooms/:roomId/assets/:assetId',
    component: AssetsGridPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.LOCATION_DETAIL, FactoryManagerPageType.ASSET_DETAIL],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/locations/:locationId/assets/:assetId',
    component: AssetPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.LOCATION_DETAIL, FactoryManagerPageType.ASSET_DETAIL],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/locations/:locationId/rooms/:roomId/assets/:assetId/asset-details',
    component: AssetDetailsPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.ASSET_DETAIL],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/locations/:locationId/assets',
    component: AssetsGridPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.LOCATION_DETAIL, FactoryManagerPageType.ASSET_LIST],
      roles: [Role.FACTORY_MANAGER]
    }
  },
  {
    path: 'factorymanager/companies/:companyId/locations/:locationId/asset-cards/:assetIdList',
    component: AssetsGridPageComponent,
    canActivate: [MainAuthGuardGuard],
    data: {
      pageTypes: [FactoryManagerPageType.LOCATION_DETAIL, FactoryManagerPageType.ASSET_LIST],
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FactoryRoutingModule { }
