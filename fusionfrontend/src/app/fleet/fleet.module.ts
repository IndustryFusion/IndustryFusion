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

import { FleetRoutingModule } from './fleet-routing.module';
import { FleetManagerPageComponentComponent } from './components/pages/fleet-manager-page-component/fleet-manager-page-component.component';
import { FleetSubHeaderComponent } from './components/content/fleet-sub-header/fleet-sub-header.component';
import { FleetPageTitleComponent } from './components/content/fleet-page-title/fleet-page-title.component';
import { AssetSeriesPageComponent } from './components/pages/asset-series-page/asset-series-page.component';
import { AssetSeriesListComponent } from './components/content/asset-series-list/asset-series-list.component';
import { ClarityModule } from '@clr/angular';
import { AssetSeriesListHeaderComponent } from './components/content/asset-series-list-header/asset-series-list-header.component';
import { AssetSeriesListItemComponent } from './components/content/asset-series-list-item/asset-series-list-item.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AssetSeriesCreateComponent } from './components/content/asset-series-create/asset-series-create.component';
import { TimelineComponent } from './components/content/timeline/timeline.component';
import { AssetSeriesCreateGeneralInformationComponent } from './components/content/asset-series-create/asset-series-create-general-information/asset-series-create-general-information.component';
import { AssetSeriesCreateConnectivitySettingsComponent } from './components/content/asset-series-create/asset-series-create-connectivity-settings/asset-series-create-connectivity-settings.component';
import { AssetSeriesCreateAttributesComponent } from './components/content/asset-series-create/asset-series-create-attributes/asset-series-create-attributes.component';
import { IFCommon } from '../common/i-f-common.module';
import { AssetSeriePageComponent } from './components/pages/asset-serie-page/asset-serie-page.component';
import { TableModule } from 'primeng/table';
import { AssetWizardComponent } from './components/content/asset-wizard/asset-wizard.component';
import { AssetWizardStepGeneralInformationComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-general-information/asset-wizard-step-general-information.component';
import { AssetWizardStepNameplateComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-nameplate/asset-wizard-step-nameplate.component';
import { AssetWizardStepAttributesComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-attributes/asset-wizard-step-attributes.component';
import { AssetWizardStepCustomerComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-customer/asset-wizard-step-customer.component';
import { AssetWizardStepFinishedComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-finished/asset-wizard-step-finished.component';
import { LabelControlDirective } from './components/content/label-control/label-control.directive';
import { AssetSeriesCreateMetricsComponent } from './components/content/asset-series-create/asset-series-create-metrics/asset-series-create-metrics.component';
import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { AssetWizardStepMetricsThresholdsComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-metrics-thresholds/asset-wizard-step-metrics-thresholds.component';
import { ThresholdListHeaderComponent } from './components/content/threshold-list-header/threshold-list-header.component';


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
    AssetSeriesCreateGeneralInformationComponent,
    AssetSeriesCreateConnectivitySettingsComponent,
    TimelineComponent,
    AssetSeriesCreateAttributesComponent,
    AssetSeriePageComponent,
    LabelControlDirective,
    AssetSeriesCreateMetricsComponent,
    AssetWizardComponent,
    AssetWizardStepGeneralInformationComponent,
    AssetWizardStepNameplateComponent,
    AssetWizardStepAttributesComponent,
    AssetWizardStepCustomerComponent,
    AssetWizardStepFinishedComponent,
    AssetWizardStepMetricsThresholdsComponent,
    ThresholdListHeaderComponent,
  ],
    imports: [
        IFCommon,
        FleetRoutingModule,
        ClarityModule,
        ReactiveFormsModule,
        TableModule,
        CalendarModule,
        AccordionModule,
    ],
  exports: [
    FleetSubHeaderComponent,
    FleetPageTitleComponent
  ]
})
export class FleetModule { }
