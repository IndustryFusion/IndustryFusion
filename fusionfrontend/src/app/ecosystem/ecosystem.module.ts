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
import { AssetTypeTemplateWizardMainComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-main/asset-type-template-wizard-main.component';
import { EcosystemSubHeaderComponent } from './components/content/ecosystem-sub-header/ecosystem-sub-header.component';
import { FieldsPageComponent } from './components/pages/fields-page/fields-page.component';
import { QuantityTypesPageComponent } from './components/pages/quantity-types-page/quantity-types-page.component';
import { UnitsPageComponent } from './components/pages/units-page/units-page.component';
import { AssetTypesPageComponent } from './components/pages/asset-types-page/asset-types-page.component';
import { ArraySortPipe } from '../pipes/arraysort.pipe';
import { AssetTypeListComponent } from './components/content/asset-type-list/asset-type-list.component';
import { BaseListComponent } from './components/content/base/base-list/base-list.component';
import { BaseListHeaderComponent } from './components/content/base/base-list-header/base-list-header.component';
import { BaseListItemComponent } from './components/content/base/base-list-item/base-list-item.component';
import { FieldListComponent } from './components/content/field-list/field-list.component';
import { FieldListHeaderComponent } from './components/content/field-list-header/field-list-header.component';
import { FieldListItemComponent } from './components/content/field-list-item/field-list-item.component';
import { QuantityTypeListComponent } from './components/content/quantity-type-list/quantity-type-list.component';
import { QuantityTypeListHeaderComponent } from './components/content/quantity-type-list-header/quantity-type-list-header.component';
import { QuantityTypeListItemComponent } from './components/content/quantity-type-list-item/quantity-type-list-item.component';
import { UnitListComponent } from './components/content/unit-list/unit-list.component';
import { UnitListHeaderComponent } from './components/content/unit-list-header/unit-list-header.component';
import { UnitListItemComponent } from './components/content/unit-list-item/unit-list-item.component';
import { QuantityTypeDialogComponent } from './components/content/quantity-type-dialog/quantity-type-dialog.component';
import { UnitDialogComponent } from './components/content/unit-dialog/unit-dialog.component';
import { FieldDialogComponent } from './components/content/field-dialog/field-dialog.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardStepOneComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step-one/asset-type-template-wizard-step-one.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardStepTwoComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step-two/asset-type-template-wizard-step-two.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardStepThreeComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step-three/asset-type-template-wizard-step-three.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardStepFourComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step-four/asset-type-template-wizard-step-four.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateWizardStepFinishedComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step-finished/asset-type-template-wizard-step-finished.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { AssetTypePageComponent } from './components/pages/asset-type-page/asset-type-page.component';
import { TableModule } from 'primeng/table';
import { QuantityTypePageComponent } from './components/pages/quantity-type-page/quantity-type-page.component';
import { IFCommon } from '../common/i-f-common.module';
import { AssetTypeTemplateWizardStepPublishComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-step-publish/asset-type-template-wizard-step-publish.component';
import { AssetTypeTemplateWizardWarningDialogComponent } from './components/content/asset-type-template/asset-type-template-wizard/asset-type-template-wizard-warning-dialog/asset-type-template-wizard-warning-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { FieldPageComponent } from './components/pages/field-page/field-page.component';
import { AssetTypeTemplatesPageComponent } from './components/pages/asset-type-templates-page/asset-type-templates-page.component';
import { AssetTypeTemplatePageComponent } from './components/pages/asset-type-template-page/asset-type-template-page.component';
import { AssetTypeTemplateDialogPublishComponent } from './components/content/asset-type-template/asset-type-template-dialog/asset-type-template-dialog-publish/asset-type-template-dialog-publish.component';
import { AssetTypeTemplateDialogUpdateComponent } from './components/content/asset-type-template/asset-type-template-dialog/asset-type-template-update-dialog/asset-type-template-dialog-update.component';
import { UnitPageComponent } from './components/pages/unit-page/unit-page.component';
import { AssetTypeTemplateFieldRowComponent } from './components/content/asset-type-template/asset-type-template-field-row/asset-type-template-field-row.component';
import { AssetTypeTemplateFieldHeaderComponent } from './components/content/asset-type-template/asset-type-template-field-header/asset-type-template-field-header.component';
import { NameWithVersionPipe } from '../pipes/namewithversion.pipe';
import { AssetTypeDialogComponent } from './components/content/asset-type-dialog/asset-type-dialog.component';

@NgModule({
  declarations: [
    AssetTypeTemplatePageComponent,
    AssetTypeTemplatesPageComponent,
    ArraySortPipe,
    AssetTypeTemplateListComponent,
    AssetTypeTemplateWizardMainComponent,
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
    FieldListHeaderComponent,
    FieldListItemComponent,
    QuantityTypeListComponent,
    QuantityTypeListHeaderComponent,
    QuantityTypeListItemComponent,
    UnitListComponent,
    UnitListHeaderComponent,
    UnitListItemComponent,
    QuantityTypeDialogComponent,
    FieldDialogComponent,
    UnitDialogComponent,
    AssetTypeTemplateWizardStepOneComponent,
    AssetTypeTemplateWizardStepTwoComponent,
    AssetTypeTemplateWizardStepThreeComponent,
    AssetTypeTemplateWizardStepFourComponent,
    AssetTypeTemplateFieldRowComponent,
    AssetTypeTemplateWizardStepFinishedComponent,
    AssetTypeTemplateWizardWarningDialogComponent,
    AssetTypeTemplateWizardStepPublishComponent,
    AssetTypePageComponent,
    AssetTypeDialogComponent,
    QuantityTypePageComponent,
    AssetTypeTemplateFieldHeaderComponent,
    FieldPageComponent,
    AssetTypeTemplateDialogPublishComponent,
    AssetTypeTemplateDialogUpdateComponent,
    NameWithVersionPipe,
  ],
  imports: [
    IFCommon,
    EcosystemRoutingModule,
    ClarityModule,
    Ng2CompleterModule,
    ReactiveFormsModule,
    TableModule,
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
