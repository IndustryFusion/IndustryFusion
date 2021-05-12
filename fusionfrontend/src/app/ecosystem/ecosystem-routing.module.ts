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

import { AssetTypeTemplatePageComponent } from './components/pages/asset-type-template-page/asset-type-template-page.component';
import { AssetTypeTemplateListComponent } from './components/content/asset-type-template-list/asset-type-template-list.component';
import { AssetTypeTemplateEditComponent } from './components/content/asset-type-template-edit/asset-type-template-edit.component';
import { AssetTypesPageComponent } from './components/pages/asset-types-page/asset-types-page.component';
import { MetricsAttributesPageComponent } from './components/pages/metrics-attributes-page/metrics-attributes-page.component';
import { QuantityTypesPageComponent } from './components/pages/quantity-types-page/quantity-types-page.component';
import { UnitsPageComponent } from './components/pages/units-page/units-page.component';
import { AssetTypeTemplatesResolver } from '../resolvers/asset-type-templates.resolver';
import { AssetTypesResolver } from '../resolvers/asset-types.resolver';
import { AssetTypeListComponent } from './components/content/asset-type-list/asset-type-list.component';
import { MetricListComponent } from './components/content/metric-list/metric-list.component';
import { MetricsResolver } from '../resolvers/metrics.resolver';
import { QuantityTypesResolver } from '../resolvers/quantity-types.resolver';
import { QuantityTypeListComponent } from './components/content/quantity-type-list/quantity-type-list.component';
import { UnitsResolver } from '../resolvers/units.resolver';
import { UnitListComponent } from './components/content/unit-list/unit-list.component';
import { AssetTypeTemplateCreateComponent } from './components/content/asset-type-template-create/asset-type-template-create.component';
import { MainAuthGuardGuard } from '../services/main-auth-guard.guard';
import {Role} from "../services/roles.model";
import {EcosystemManagerPageType} from "./ecosystem.routing.model";
import {AssetTypePageComponent} from "./components/pages/asset-type-page/asset-type-page.component";
import {AssetTypeDetailsResolver} from "../resolvers/asset-type-details.resolver";
import {AssetTypeEditComponent} from "./components/content/asset-type-edit/asset-type-edit.component";

const routes: Routes = [
  {
    path: 'ecosystemmanager/assettypetemplate',
    component: AssetTypeTemplatePageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      templates: AssetTypeTemplatesResolver,
    },
    data: {
      pageTypes: [EcosystemManagerPageType.ASSET_TYPE_TEMPLATE_LIST],
      roles: [Role.ECOSYSTEM_MANAGER]
    },
    children: [{
      path: '',
      component: AssetTypeTemplateListComponent
    },
    {
      path: 'create',
      component: AssetTypeTemplateCreateComponent,
      resolve: {
        assetTypes: AssetTypesResolver,
        metrics: MetricsResolver,
        units: UnitsResolver,
        quantity: QuantityTypesResolver,
      }
    },
    {
      path: ':id/edit',
      component: AssetTypeTemplateEditComponent
    }]
  },
  {
    path: 'ecosystemmanager/assettypes',
    component: AssetTypesPageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      assetTypes: AssetTypeDetailsResolver,
    },
    data: {
      pageTypes: [EcosystemManagerPageType.ASSET_TYPE_LIST],
      roles: [Role.ECOSYSTEM_MANAGER]
    },
    children: [{
      path: '',
      component: AssetTypeListComponent,
    },
    {
      path: ':id/edit',
      component: AssetTypeEditComponent
    }]
  },
  {
    path: 'ecosystemmanager/assettypes/:assettypeId',
    component: AssetTypePageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      assetTypes: AssetTypesResolver,
      templates: AssetTypeTemplatesResolver,
    },
    data: {
      pageTypes: [EcosystemManagerPageType.ASSET_TYPE_DETAIL],
      roles: [Role.ECOSYSTEM_MANAGER]
    },
    children: [{
      path: '',
      component: AssetTypeTemplateListComponent, // TODO
    }]
  },
  {
    path: 'ecosystemmanager/metrics',
    component: MetricsAttributesPageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      metrics: MetricsResolver,
      units: UnitsResolver,
    },
    data: {
      pageTypes: [EcosystemManagerPageType.METRIC_ATTRIBUTE_LIST],
      roles: [Role.ECOSYSTEM_MANAGER]
    },
    children: [{
      path: '',
      component: MetricListComponent,
    }]
  },
  {
    path: 'ecosystemmanager/quantity',
    component: QuantityTypesPageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      quantity: QuantityTypesResolver,
      units: UnitsResolver,
    },
    data: {
      pageTypes: [EcosystemManagerPageType.QUANTITY_TYPE_LIST],
      roles: [Role.ECOSYSTEM_MANAGER]
    },
    children: [{
      path: '',
      component: QuantityTypeListComponent,
    }]
  },
  {
    path: 'ecosystemmanager/units',
    component: UnitsPageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      quantity: QuantityTypesResolver,
      units: UnitsResolver,
    },
    data: {
      pageTypes: [EcosystemManagerPageType.UNIT_LIST],
      roles: [Role.ECOSYSTEM_MANAGER]
    },
    children: [{
      path: '',
      component: UnitListComponent,
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcosystemRoutingModule { }
