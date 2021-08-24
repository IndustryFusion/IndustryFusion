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
import { FusionAppletsOverviewComponent } from './components/fusion-applets-overview/fusion-applets-overview.component';
import { FusionAppletDetailComponent } from './components/fusion-applet-detail/fusion-applet-detail.component';
import { FusionAppletPageComponent } from './pages/fusion-applet-page/fusion-applet-page.component';
import { FusionAppletEditorComponent } from './components/fusion-applet-editor/fusion-applet-editor.component';
import { OispDeviceQuery } from '../store/oisp/oisp-device/oisp-device.query';

const routes: Routes = [
  {
    path: 'fusion-applets',
    children: [
      {
        path: 'overview',
        component: FusionAppletsOverviewComponent,
      },
      {
        path: 'archiv',
        component: FusionAppletsOverviewComponent,
      },
      {
        path: ':fusionAppletId',
        component: FusionAppletPageComponent,
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: FusionAppletDetailComponent
          },
          {
            path: 'editor',
            component: FusionAppletEditorComponent,
            resolve: {
              devices: OispDeviceQuery
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
