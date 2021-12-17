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
import { ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';

import { EcosystemRoutingModule } from './ecosystem-routing.module';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateListComponent } from './components/content/asset-type-template/asset-type-template-list/asset-type-template-list.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard.component';
import { EcosystemSubHeaderComponent } from './components/content/ecosystem-sub-header/ecosystem-sub-header.component';
import { FieldsPageComponent } from './components/pages/fields-page/fields-page.component';
import { QuantityTypesPageComponent } from './components/pages/quantity-types-page/quantity-types-page.component';
import { UnitsPageComponent } from './components/pages/units-page/units-page.component';
import { AssetTypesPageComponent } from './components/pages/asset-types-page/asset-types-page.component';
import { ArraySortPipe } from '../shared/pipes/arraysort.pipe';
import { AssetTypeListComponent } from './components/content/asset-type-list/asset-type-list.component';
import { BaseListComponent } from './components/content/base/base-list/base-list.component';
import { BaseListHeaderComponent } from './components/content/base/base-list-header/base-list-header.component';
import { BaseListItemComponent } from './components/content/base/base-list-item/base-list-item.component';
import { FieldListComponent } from './components/content/field-list/field-list.component';
import { QuantityTypeListComponent } from './components/content/quantity-type-list/quantity-type-list.component';
import { UnitListComponent } from './components/content/unit-list/unit-list.component';
import { QuantityTypeDialogComponent } from './components/content/quantity-type-dialog/quantity-type-dialog.component';
import { UnitDialogComponent } from './components/content/unit-dialog/unit-dialog.component';
import { FieldDialogComponent } from './components/content/field-dialog/field-dialog.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardStepStartComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step/asset-type-template-wizard-step-start/asset-type-template-wizard-step-start.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardStepMetricsComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step/asset-type-template-wizard-step-metrics/asset-type-template-wizard-step-metrics.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardStepAttributesComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step/asset-type-template-wizard-step-attributes/asset-type-template-wizard-step-attributes.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardStepReviewComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step/asset-type-template-wizard-step-review/asset-type-template-wizard-step-review.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardStepFinishedComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step/asset-type-template-wizard-step-finished/asset-type-template-wizard-step-finished.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { AssetTypePageComponent } from './components/pages/asset-type-page/asset-type-page.component';
import { TableModule } from 'primeng/table';
import { QuantityTypePageComponent } from './components/pages/quantity-type-page/quantity-type-page.component';
import { SharedModule } from '../shared/shared.module';
import { AssetTypeTemplateWizardStepPublishComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step/asset-type-template-wizard-step-publish/asset-type-template-wizard-step-publish.component';
import { AssetTypeTemplateWizardWarningDialogComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-warning-dialog/asset-type-template-wizard-warning-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { FieldPageComponent } from './components/pages/field-page/field-page.component';
import { AssetTypeTemplatesPageComponent } from './components/pages/asset-type-templates-page/asset-type-templates-page.component';
import { AssetTypeTemplatePageComponent } from './components/pages/asset-type-template-page/asset-type-template-page.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateDialogPublishComponent } from './components/content/asset-type-template/asset-type-template-dialog/asset-type-template-dialog-publish/asset-type-template-dialog-publish.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateDialogUpdateComponent } from './components/content/asset-type-template/asset-type-template-dialog/asset-type-template-update-dialog/asset-type-template-dialog-update.component';
import { UnitPageComponent } from './components/pages/unit-page/unit-page.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardSharedFieldComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-shared/asset-type-template-wizard-shared-field/asset-type-template-wizard-shared-field.component';
import { NameWithVersionPipe } from '../shared/pipes/namewithversion.pipe';
import { AssetTypeDialogComponent } from './components/content/asset-type-dialog/asset-type-dialog.component';
import { AssetTypeTemplateWizardStepSubsystemsComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step/asset-type-template-wizard-step-subsystems/asset-type-template-wizard-step-subsystems.component';
import { TooltipModule } from 'primeng/tooltip';
import { AssetTypeTemplateWizardSharedSubsystemsComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-shared/asset-type-template-wizard-shared-subsystems/asset-type-template-wizard-shared-subsystems.component';
import { AssetTypeTemplateWizardStepPeersComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step/asset-type-template-wizard-step-peers/asset-type-template-wizard-step-peers.component';
import { AssetTypeTemplateWizardSharedPeersComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-shared/asset-type-template-wizard-shared-peers/asset-type-template-wizard-shared-peers.component';

@NgModule({
  declarations: [
    AssetTypeTemplatePageComponent,
    AssetTypeTemplatesPageComponent,
    ArraySortPipe,
    AssetTypeTemplateListComponent,
    AssetTypeTemplateWizardComponent,
    EcosystemSubHeaderComponent,
    FieldsPageComponent,
    QuantityTypesPageComponent,
    UnitPageComponent,
    UnitsPageComponent,
    AssetTypesPageComponent,
    AssetTypeListComponent,
    BaseListComponent,
    BaseListHeaderComponent,
    BaseListItemComponent,
    FieldListComponent,
    QuantityTypeListComponent,
    UnitListComponent,
    QuantityTypeDialogComponent,
    FieldDialogComponent,
    UnitDialogComponent,
    AssetTypeTemplateWizardStepStartComponent,
    AssetTypeTemplateWizardStepMetricsComponent,
    AssetTypeTemplateWizardStepAttributesComponent,
    AssetTypeTemplateWizardStepSubsystemsComponent,
    AssetTypeTemplateWizardStepReviewComponent,
    AssetTypeTemplateWizardSharedFieldComponent,
    AssetTypeTemplateWizardSharedSubsystemsComponent,
    AssetTypeTemplateWizardSharedPeersComponent,
    AssetTypeTemplateWizardStepFinishedComponent,
    AssetTypeTemplateWizardWarningDialogComponent,
    AssetTypeTemplateWizardStepPublishComponent,
    AssetTypePageComponent,
    AssetTypeDialogComponent,
    QuantityTypePageComponent,
    FieldPageComponent,
    AssetTypeTemplateDialogPublishComponent,
    AssetTypeTemplateDialogUpdateComponent,
    NameWithVersionPipe,
    AssetTypeTemplateWizardStepPeersComponent,
  ],
    imports: [
        SharedModule,
        EcosystemRoutingModule,
        ClarityModule,
        Ng2CompleterModule,
        ReactiveFormsModule,
        TableModule,
        TooltipModule,
    ],
  exports: [
    EcosystemSubHeaderComponent,
  ],
  providers: [
    DialogService,
    NameWithVersionPipe
  ]
})
export class EcosystemModule {
}
