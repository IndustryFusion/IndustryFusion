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
import { CommonModule } from '@angular/common';
import { FusionAppletsOverviewComponent } from './components/fusion-applets-overview/fusion-applets-overview.component';
import { FusionAppletsRoutingModule } from './fusion-applets-routing.module';
import { FusionAppletPageTitleComponent } from './components/fusion-applets-page-title/fusion-applet-page-title.component';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { IFCommon } from '../common/i-f-common.module';
import { CreateFusionAppletComponent } from './components/create-fusion-applet/create-fusion-applet.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EnumHelpers } from '../common/utils/enum-helpers';
import { FusionAppletDetailComponent } from './components/fusion-applet-detail/fusion-applet-detail.component';
import { FusionAppletPageComponent } from './pages/fusion-applet-page/fusion-applet-page.component';
import { FusionAppletsSubHeaderComponent } from './components/fusion-applets-sub-header/fusion-applets-sub-header.component';
import { FusionAppletEditorComponent } from './components/fusion-applet-editor/fusion-applet-editor.component';
import { RuleStatusUtil } from './util/rule-status-util';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectModule } from 'primeng/multiselect';
import { AppletActionComponent } from './components/fusion-applet-editor/applet-action-list/applet-action/applet-action.component';
import { AppletActionMailComponent } from './components/fusion-applet-editor/applet-action-list/applet-action/applet-action-mail/applet-action-mail.component';
import { AppletActionWebhookComponent } from './components/fusion-applet-editor/applet-action-list/applet-action/applet-action-webhook/applet-action-webhook.component';
import { AppletActionListComponent } from './components/fusion-applet-editor/applet-action-list/applet-action-list.component';
import { AppletConditionsComponent } from './components/fusion-applet-editor/applet-conditions/applet-conditions.component';
import { ConditionTimeSelectorComponent } from './components/fusion-applet-editor/applet-conditions/applet-conditions-value/condition-time-selector/condition-time-selector.component';
import { AppletConditionsValueComponent } from './components/fusion-applet-editor/applet-conditions/applet-conditions-value/applet-conditions-value.component';
import { ValidIconComponent } from './components/fusion-applet-editor/valid-icon/valid-icon.component';
import { InplaceModule } from 'primeng/inplace';
import { FleetModule } from '../fleet/fleet.module';
import { ControlLimitSelectorComponent } from './components/fusion-applet-editor/applet-conditions/applet-conditions-value/control-limit-selector/control-limit-selector.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService } from 'primeng/api';



@NgModule({
  declarations: [
    FusionAppletsOverviewComponent,
    FusionAppletPageTitleComponent,
    CreateFusionAppletComponent,
    FusionAppletDetailComponent,
    FusionAppletPageComponent,
    FusionAppletsSubHeaderComponent,
    FusionAppletEditorComponent,
    AppletActionComponent,
    AppletActionMailComponent,
    AppletActionWebhookComponent,
    AppletActionListComponent,
    AppletConditionsComponent,
    ConditionTimeSelectorComponent,
    AppletConditionsValueComponent,
    ValidIconComponent,
    ControlLimitSelectorComponent,
  ],
  imports: [
    CommonModule,
    FusionAppletsRoutingModule,
    TableModule,
    InputSwitchModule,
    IFCommon,
    ReactiveFormsModule,
    CardModule,
    AccordionModule,
    MultiSelectModule,
    InplaceModule,
    FleetModule,
    InputNumberModule,
  ],
  exports: [
    FusionAppletPageTitleComponent,
    FusionAppletsSubHeaderComponent,
  ],
  providers: [
    EnumHelpers,
    RuleStatusUtil,
    ConfirmationService
  ]
})
export class FusionAppletsModule { }
