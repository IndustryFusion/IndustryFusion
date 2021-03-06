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

import { LaunchpadPageComponent } from './components/pages/launchpad-page/launchpad-page.component';
import { MainAuthGuardGuard } from './services/main-auth-guard.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    component: LaunchpadPageComponent,
    canActivate: [MainAuthGuardGuard]
  },
  {
     path: 'ecosystemmanager',
     redirectTo: '/ecosystemmanager/assettypetemplate',
     pathMatch: 'full'
  },
  {
    path: 'factorymanager',
    redirectTo: '/factorymanager/companies',
    pathMatch: 'full'
  },
  {
    path: 'fleetmanager',
    redirectTo: '/fleetmanager/companies',
    pathMatch: 'full'
  },
  {
    path: 'settings',
    redirectTo: '/settings/template',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
