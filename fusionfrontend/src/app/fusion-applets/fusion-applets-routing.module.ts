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
import { FusionAppletDetailComponent } from './components/fusion-applet-detail/fusion-applet-detail.component';
import { FusionAppletPageComponent } from './pages/fusion-applet-page/fusion-applet-page.component';
import { FusionAppletEditorComponent } from './components/fusion-applet-editor/fusion-applet-editor.component';
import { OispDeviceResolver } from '../core/resolvers/oisp-device-resolver';
import { FusionAppletsOverviewComponent } from './pages/fusion-applets-overview/fusion-applets-overview.component';
import { OispRuleFilteredByStatusResolver, OispSingleRuleResolver } from '../core/resolvers/oisp-rule-filtered-by-status.resolver';
import { OispRuleQuery } from '../core/store/oisp/oisp-rule/oisp-rule.query';
import { FusionAppletBreadCrumbs } from './fusion-applets-routing.model';

const routes: Routes = [
  {
    path: 'fusion-applets',
    children: [
      {
        path: 'overview',
        component: FusionAppletsOverviewComponent,
        data: {
          breadcrumb: FusionAppletBreadCrumbs.OVERVIEW,
        },
        resolve: {
          rules: OispRuleFilteredByStatusResolver
        },
      },
      {
        path: 'archiv',
        component: FusionAppletsOverviewComponent,
        data: {
          breadcrumb: FusionAppletBreadCrumbs.ARCHIVE,
        },
        resolve: {
          rules: OispRuleFilteredByStatusResolver
        },
      },
      {
        path: 'detail',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'editor',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'detail',
        component: FusionAppletPageComponent,
        data: {
          breadcrumb: FusionAppletBreadCrumbs.APPLET_DETAIL,
        },
        children: [{
          path: ':fusionAppletId',
          component: FusionAppletDetailComponent,
          data: {
            breadcrumb: OispRuleQuery,
          },
          resolve: {
            rules: OispSingleRuleResolver
          }
        }]
      },
      {
        path: 'editor',
        component: FusionAppletPageComponent,
        data: {
          breadcrumb: FusionAppletBreadCrumbs.APPLET_EDITOR,
        },
        resolve: {
          devices: OispDeviceResolver,
        },
        children: [
          {
            path: ':fusionAppletId',
            component: FusionAppletEditorComponent,
            data: {
              breadcrumb: OispRuleQuery,
            },
            resolve: {
              rules: OispSingleRuleResolver
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FusionAppletsRoutingModule { }
