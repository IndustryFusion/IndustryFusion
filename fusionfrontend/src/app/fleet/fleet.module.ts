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

import { FleetRoutingModule } from './fleet-routing.module';
import { FleetManagerPageComponentComponent } from './components/pages/fleet-manager-page-component/fleet-manager-page-component.component';
import { FleetSubHeaderComponent } from './components/content/fleet-sub-header/fleet-sub-header.component';
import { FleetPageTitleComponent } from './components/content/fleet-page-title/fleet-page-title.component';
import { AssetSeriesPageComponent } from './components/pages/asset-series-page/asset-series-page.component';
import { AssetSeriesListComponent } from './components/content/asset-series-list/asset-series-list.component';
import { ClarityModule } from '@clr/angular';
import { AssetSeriesListHeaderComponent } from './components/content/asset-series-list-header/asset-series-list-header.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AssetSeriesListItemComponent } from './components/content/asset-series-list-item/asset-series-list-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssetSeriesCreateStepOneComponent } from './components/content/asset-series-create/asset-series-create-step-one/asset-series-create-step-one.component';
import { AssetSeriesCreateComponent } from './components/content/asset-series-create/asset-series-create.component';
import { TimelineComponent } from './components/content/timeline/timeline.component';
import { AssetSeriesCreateStepTwoComponent } from './components/content/asset-series-create/asset-series-create-step-two/asset-series-create-step-two.component';
import { AssetSeriesCreateStepTreeComponent } from './components/content/asset-series-create/asset-series-create-step-three/asset-series-create-step-tree.component';
import { AssetSeriesCreateStepFourComponent } from './components/content/asset-series-create/asset-series-create-step-four/asset-series-create-step-four.component';
import { IFCommon } from '../common/i-f-common.module';


@NgModule({
  declarations: [
    FleetManagerPageComponentComponent,
    FleetSubHeaderComponent,
    FleetPageTitleComponent,
    AssetSeriesPageComponent,
    AssetSeriesListComponent,
    AssetSeriesListHeaderComponent,
    AssetSeriesListItemComponent,
    AssetSeriesCreateComponent,
    AssetSeriesCreateStepOneComponent,
    AssetSeriesCreateStepTwoComponent,
    AssetSeriesCreateStepTreeComponent,
    TimelineComponent,
    AssetSeriesCreateStepFourComponent,
  ],
  imports: [
    IFCommon,
    CommonModule,
    FleetRoutingModule,
    ClarityModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    FleetSubHeaderComponent,
    FleetPageTitleComponent
  ]
})
export class FleetModule { }
