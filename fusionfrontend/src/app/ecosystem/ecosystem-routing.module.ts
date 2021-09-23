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
import { AssetTypeTemplateListComponent } from './components/content/asset-type-template/asset-type-template-list/asset-type-template-list.component';
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
import { MainAuthGuardGuard } from '../services/main-auth-guard.guard';
import { Role } from '../services/roles.model';
import { AssetTypePageComponent } from './components/pages/asset-type-page/asset-type-page.component';
import { AssetTypeDetailsResolver } from '../resolvers/asset-type-details.resolver';
import { QuantityTypePageComponent } from './components/pages/quantity-type-page/quantity-type-page.component';
import { UnitPageComponent } from './components/pages/unit-page/unit-page.component';
import { FieldPageComponent } from './components/pages/field-page/field-page.component';
import { AssetTypeTemplatesPageComponent } from './components/pages/asset-type-templates-page/asset-type-templates-page.component';
import { AssetTypeTemplateQuery } from '../store/asset-type-template/asset-type-template.query';
import { AssetTypeQuery } from '../store/asset-type/asset-type.query';
import { FieldQuery } from '../store/field/field.query';
import { QuantityTypeQuery } from '../store/quantity-type/quantity-type.query';
import { UnitQuery } from '../store/unit/unit.query';

const routes: Routes = [
  {
    path: 'ecosystemmanager/assettypes',
    component: AssetTypesPageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      assetTypes: AssetTypeDetailsResolver,
    },
    data: {
      roles: [Role.ECOSYSTEM_MANAGER],
      breadcrumb: 'Asset Types',
    },
    children: [
      {
        path: '',
        component: AssetTypeListComponent,
        data: {
          breadcrumb: null,
        }
      },
      {
        path: ':assettypeId',
        component: AssetTypePageComponent,
        canActivate: [MainAuthGuardGuard],
        resolve: {
          assetTypes: AssetTypesResolver,
          templates: AssetTypeTemplatesResolver,
        },
        data: {
          roles: [Role.ECOSYSTEM_MANAGER],
          breadcrumb: AssetTypeQuery,
        },
        children: [{
          path: '',
          component: AssetTypeTemplateListComponent,
          data: {
            breadcrumb: null,
          }
        }]
      }]
  },
  {
    path: 'ecosystemmanager/assettypetemplate',
    component: AssetTypeTemplatesPageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      templates: AssetTypeTemplatesResolver,
    },
    data: {
      roles: [Role.ECOSYSTEM_MANAGER],
      breadcrumb: 'Asset Type Templates',
    },
    children: [
      {
        path: '',
        component: AssetTypeTemplateListComponent,
        data: {
          breadcrumb: null,
        }
      },
      {
        path: ':assetTypeTemplateId',
        component: AssetTypeTemplatePageComponent,
        resolve: {
          assetTypes: AssetTypesResolver,
          fields: FieldsResolver,
          units: UnitsResolver,
        },
        data: {
          roles: [Role.ECOSYSTEM_MANAGER],
          breadcrumb: AssetTypeTemplateQuery,
        },
      }
    ],
  },
  {
    path: 'ecosystemmanager/fields',
    component: FieldsPageComponent,
    canActivate: [MainAuthGuardGuard],
    resolve: {
      fields: FieldsResolver,
      units: UnitsResolver,
      quantityTypes: QuantityTypesResolver,
    },
    data: {
      roles: [Role.ECOSYSTEM_MANAGER],
      breadcrumb: 'Metrics & Attributes',
    },
    children: [
      {
        path: '',
        component: FieldListComponent,
        data: {
          breadcrumb: null,
        }
      },
      {
        path: ':fieldId',
        component: FieldPageComponent,
        canActivate: [MainAuthGuardGuard],
        resolve: {
          fields: FieldsResolver,
          units: UnitsResolver,
          quantityTypes: QuantityTypesResolver,
        },
        data: {
          roles: [Role.ECOSYSTEM_MANAGER],
          breadcrumb: FieldQuery,
        }
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
      roles: [Role.ECOSYSTEM_MANAGER],
      breadcrumb: 'Quantity Types',
    },
    children: [
      {
        path: '',
        component: QuantityTypeListComponent,
        data: {
          breadcrumb: null,
        }
      },
      {
        path: ':quantitytypeId',
        component: QuantityTypePageComponent,
        canActivate: [MainAuthGuardGuard],
        resolve: {
          quantityTypes: QuantityTypesResolver,
          units: UnitsResolver,
        },
        data: {
          roles: [Role.ECOSYSTEM_MANAGER],
          breadcrumb: QuantityTypeQuery,
        },
        children: [{
          path: '',
          component: UnitListComponent,
          data: {
            breadcrumb: null,
          }
        }]
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
      roles: [Role.ECOSYSTEM_MANAGER],
      breadcrumb: 'Units'
    },
    children: [
      {
        path: '',
        component: UnitListComponent,
        data: {
          breadcrumb: null
        }
      },
      {
        path: ':unitId',
        component: UnitPageComponent,
        canActivate: [MainAuthGuardGuard],
        resolve: {
          quantityTypes: QuantityTypesResolver,
          units: UnitsResolver,
        },
        data: {
          roles: [Role.ECOSYSTEM_MANAGER],
          breadcrumb: UnitQuery,
        },
      }]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcosystemRoutingModule {
}
