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

import { TableModule } from 'primeng/table';
import { SharedModule } from '../shared/shared.module';
import { NotificationsPageComponent } from './pages/notifications-page/notifications-page.component';
import { NotificationsSubHeaderComponent } from './content/notifications-sub-header/notifications-sub-header.component';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { ClrAlertModule, ClrIconModule } from '@clr/angular';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@NgModule({
  declarations: [
    NotificationsSubHeaderComponent,
    NotificationsPageComponent,
  ],
  imports: [
    SharedModule,
    NotificationsRoutingModule,
    TableModule,
    ClrIconModule,
    ClrAlertModule,
    OverlayPanelModule
  ],
  exports: [
    NotificationsSubHeaderComponent,
  ]
})
export class NotificationsModule {
}
