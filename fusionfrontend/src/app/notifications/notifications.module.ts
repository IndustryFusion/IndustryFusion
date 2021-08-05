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
import { IFCommon } from '../common/i-f-common.module';
import { NotificationsPageComponent } from './pages/notifications-page/notifications-page.component';
import { NotificationsPageTitleComponent } from './content/notifications-page-title/notifications-page-title.component';
import { NotificationsSubHeaderComponent } from './content/notifications-sub-header/notifications-sub-header.component';
import { NotificationsRoutingModule } from './notifications-routing.module';

@NgModule({
  declarations: [
    NotificationsPageTitleComponent,
    NotificationsSubHeaderComponent,
    NotificationsPageComponent,
  ],
    imports: [
        IFCommon,
        NotificationsRoutingModule,
        TableModule
      ],
  exports: [
    NotificationsPageTitleComponent,
    NotificationsSubHeaderComponent,
  ]
})
export class NotificationsModule { }
