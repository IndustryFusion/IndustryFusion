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
import { FieldsPageComponent } from './components/pages/fields-page/fields-page.component';
import { QuantityTypesPageComponent } from './components/pages/quantity-types-page/quantity-types-page.component';
import { UnitsPageComponent } from './components/pages/units-page/units-page.component';
import { AssetTypeTemplatesResolver } from '../resolvers/asset-type-templates.resolver';
import { AssetTypesResolver } from '../resolvers/asset-types.resolver';
import { AssetTypeListComponent } from './components/content/asset-type-list/asset-type-list.component';
import { FieldListComponent } from './components/content/field-list/field-list.component';
import { FieldsResolver } from '../resolvers/fields-resolver';
import { QuantityTypesResolver } from '../resolvers/quantity-types.resolver';
import { QuantityTypeListComponent } from './components/content/quantity-type-list/quantity-type-list.component';
import { UnitsResolver } from '../resolvers/units.resolver';
import { UnitListComponent } from './components/content/unit-list/unit-list.component';
import { AssetTypeTemplateCreateComponent } from './components/content/asset-type-template-create/asset-type-template-create.component';
import { MainAuthGuardGuard } from '../services/main-auth-guard.guard';
import { Role } from '../services/roles.model';
import { EcosystemManagerPageType } from './ecosystem.routing.model';
import { AssetTypePageComponent } from './components/pages/asset-type-page/asset-type-page.component';
import { AssetTypeDetailsResolver } from '../resolvers/asset-type-details.resolver';
import { AssetTypeEditComponent } from './components/content/asset-type-edit/asset-type-edit.component';
import { QuantityTypePageComponent } from './components/pages/quantity-type-page/quantity-type-page.component';

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
        metrics: FieldsResolver,
        units: UnitsResolver,
        quantityTypes: QuantityTypesResolver,
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
      component: AssetTypeTemplateListComponent,
    }]
  },
  {
    path: 'ecosystemmanager/fields',
    component: FieldsPageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      metrics: FieldsResolver,
      units: UnitsResolver,
      quantityTypes: QuantityTypesResolver,
    },
    data: {
      pageTypes: [EcosystemManagerPageType.FIELD_LIST],
      roles: [Role.ECOSYSTEM_MANAGER]
    },
    children: [{
      path: '',
      component: FieldListComponent,
    }]
  },
  {
    path: 'ecosystemmanager/quantitytypes',
    component: QuantityTypesPageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      quantityTypes: QuantityTypesResolver,
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
    path: 'ecosystemmanager/quantitytypes/:quantitytypeId',
    component: QuantityTypePageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      quantityTypes: QuantityTypesResolver,
      units: UnitsResolver,
    },
    data: {
      pageTypes: [EcosystemManagerPageType.QUANTITY_TYPE_DETAIL],
      roles: [Role.ECOSYSTEM_MANAGER]
    },
    children: [{
      path: '',
      component: UnitListComponent,
    }]
  },
  {
    path: 'ecosystemmanager/units',
    component: UnitsPageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      quantityTypes: QuantityTypesResolver,
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
