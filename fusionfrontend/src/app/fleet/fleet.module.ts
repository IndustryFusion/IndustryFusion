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
import { FleetSubHeaderComponent } from './components/content/fleet-sub-header/fleet-sub-header.component';
import { AssetSeriesPageComponent } from './components/pages/asset-series-page/asset-series-page.component';
import { AssetSeriesListComponent } from './components/content/asset-series-list/asset-series-list.component';
import { ClarityModule } from '@clr/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { AssetSeriesWizardComponent } from './components/content/asset-series-wizard/asset-series-wizard.component';
import { TimelineComponent } from './components/content/timeline/timeline.component';
import { AssetSeriesWizardGeneralInformationComponent } from './components/content/asset-series-wizard/asset-series-wizard-general-information/asset-series-wizard-general-information.component';
import { AssetSeriesWizardNameplateAndConnectivitySettingsComponent } from './components/content/asset-series-wizard/asset-series-wizard-nameplate-and-connectivity-settings/asset-series-wizard-nameplate-and-connectivity-settings.component';
import { AssetSeriesWizardAttributesComponent } from './components/content/asset-series-wizard/asset-series-wizard-attributes/asset-series-wizard-attributes.component';
import { SharedModule } from '../shared/shared.module';
import { AssetSeriesOverviewPageComponent } from './components/pages/asset-series-overview-page/asset-series-overview-page.component';
import { TableModule } from 'primeng/table';
import { AssetWizardComponent } from './components/content/asset-wizard/asset-wizard.component';
import { AssetWizardStepGeneralInformationComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-general-information/asset-wizard-step-general-information.component';
import { AssetWizardStepNameplateComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-nameplate/asset-wizard-step-nameplate.component';
import { AssetWizardStepAttributesComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-attributes/asset-wizard-step-attributes.component';
import { AssetWizardStepCustomerDataComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-customer-data/asset-wizard-step-customer-data.component';
import { AssetSeriesWizardMetricsComponent } from './components/content/asset-series-wizard/asset-series-wizard-metrics/asset-series-wizard-metrics.component';
import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { AssetWizardStepMetricsThresholdsComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-metrics-thresholds/asset-wizard-step-metrics-thresholds.component';
import { AssetSeriesWizardFooterComponent } from './components/content/asset-series-wizard/asset-series-wizard-footer/asset-series-wizard-footer.component';
import { AssetWizardStepReviewComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-review/asset-wizard-step-review.component';
import { AssetWizardSharedMetricsComponent } from './components/content/asset-wizard/asset-wizard-shared/asset-wizard-shared-metrics/asset-wizard-shared-metrics.component';
import { AssetWizardSharedAttributesComponent } from './components/content/asset-wizard/asset-wizard-shared/asset-wizard-shared-attributes/asset-wizard-shared-attributes.component';
import { AgmCoreModule } from '@agm/core';
// tslint:disable-next-line:max-line-length
import { AssetWizardStepSubsystemsComponent } from './components/content/asset-wizard/asset-wizard-step/asset-wizard-step-subsystems/asset-wizard-step-subsystems.component';
// tslint:disable-next-line:max-line-length
import { AssetWizardSharedSubsystemsComponent } from './components/content/asset-wizard/asset-wizard-shared/asset-wizard-shared-subsystems/asset-wizard-shared-subsystems.component';
import { AssetSeriesDetailsSubHeaderComponent } from './components/content/asset-series-details/asset-serie-details-sub-header/asset-series-details-sub-header.component';
import { AssetSeriesDetailsInfoComponent } from './components/content/asset-series-details/asset-series-details-info/asset-series-details-info.component';
import { AssetSeriesAssetSubHeaderComponent } from './components/content/asset-series-asset-details/asset-series-asset-sub-header/asset-series-asset-sub-header.component';
import { AssetSeriesAssetDigitalNameplateComponent } from './components/pages/asset-series-asset/asset-series-asset-digital-nameplate/asset-series-asset-digital-nameplate.component';
import { CardModule } from 'primeng/card';
import { AssetSeriesAssetInfoComponent } from './components/content/asset-series-asset-details/asset-series-asset-info/asset-series-asset-info.component';
import { AssetSeriesStatusComponent } from './components/content/asset-series-status/asset-series-status.component';
import { AssetSeriesStatusPipe } from '../shared/pipes/asset-series-status-pipe';
import { AssetActivationStatusComponent } from './components/content/asset-activation-status/asset-activation-status.component';
import { AssetActivationStatusPipe } from '../shared/pipes/asset-activation-status-pipe';
import { AssetSeriesWizardNameplateAndConnectivitySettingsTooltipComponent } from './components/content/asset-series-wizard/asset-series-wizard-nameplate-and-connectivity-settings/asset-series-wizard-nameplate-and-connectivity-settings-tooltip/asset-series-wizard-nameplate-and-connectivity-settings-tooltip.component';
import { TooltipModule } from 'primeng/tooltip';


@NgModule({
  declarations: [
    FleetSubHeaderComponent,
    AssetSeriesPageComponent,
    AssetSeriesListComponent,
    AssetSeriesWizardComponent,
    AssetSeriesWizardGeneralInformationComponent,
    AssetSeriesWizardNameplateAndConnectivitySettingsComponent,
    TimelineComponent,
    AssetSeriesWizardAttributesComponent,
    AssetSeriesOverviewPageComponent,
    AssetSeriesWizardMetricsComponent,
    AssetWizardComponent,
    AssetWizardStepGeneralInformationComponent,
    AssetWizardStepNameplateComponent,
    AssetWizardStepAttributesComponent,
    AssetWizardStepCustomerDataComponent,
    AssetWizardStepMetricsThresholdsComponent,
    AssetSeriesWizardFooterComponent,
    AssetSeriesWizardNameplateAndConnectivitySettingsTooltipComponent,
    AssetSeriesWizardGeneralInformationComponent,
    AssetWizardStepReviewComponent,
    AssetWizardSharedMetricsComponent,
    AssetWizardSharedAttributesComponent,
    AssetWizardStepSubsystemsComponent,
    AssetWizardSharedSubsystemsComponent,
    AssetSeriesDetailsSubHeaderComponent,
    AssetSeriesDetailsInfoComponent,
    AssetSeriesAssetSubHeaderComponent,
    AssetSeriesAssetDigitalNameplateComponent,
    AssetSeriesAssetInfoComponent,
    AssetSeriesStatusComponent,
    AssetSeriesStatusPipe,
    AssetActivationStatusComponent,
    AssetActivationStatusPipe,
  ],
    imports: [
        SharedModule,
        FleetRoutingModule,
        ClarityModule,
        ReactiveFormsModule,
        TableModule,
        CalendarModule,
        AccordionModule,
        AgmCoreModule,
        CardModule,
        TooltipModule,
    ],
  exports: [
    FleetSubHeaderComponent,
    AssetSeriesDetailsSubHeaderComponent,
    AssetSeriesAssetSubHeaderComponent,
  ]
})
export class FleetModule {
}
