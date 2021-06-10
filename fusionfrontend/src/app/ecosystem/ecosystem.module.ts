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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { EcosystemRoutingModule } from './ecosystem-routing.module';
import { AssetTypeTemplatePageComponent } from './components/pages/asset-type-template-page/asset-type-template-page.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateListHeaderComponent } from './components/content/asset-type-template-list-header/asset-type-template-list-header.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateListItemComponent } from './components/content/asset-type-template-list-item/asset-type-template-list-item.component';
import { AssetTypeTemplateListComponent } from './components/content/asset-type-template-list/asset-type-template-list.component';
import { AssetTypeTemplateEditComponent } from './components/content/asset-type-template-edit/asset-type-template-edit.component';
import { AssetTypeTemplateCreateComponent } from './components/content/asset-type-template-create/asset-type-template-create.component';
import { EcosystemSubHeaderComponent } from './components/content/ecosystem-sub-header/ecosystem-sub-header.component';
import { EcosystemPageTitleComponent } from './components/content/ecosystem-page-title/ecosystem-page-title.component';
import { FieldsPageComponent } from './components/pages/fields-page/fields-page.component';
import { QuantityTypesPageComponent } from './components/pages/quantity-types-page/quantity-types-page.component';
import { UnitsPageComponent } from './components/pages/units-page/units-page.component';
import { AssetTypesPageComponent } from './components/pages/asset-types-page/asset-types-page.component';
import { ArraySortPipe } from '../pipes/arraysort.pipe';
import { AssetTypeListComponent } from './components/content/asset-type-list/asset-type-list.component';
import { AssetTypeListHeaderComponent } from './components/content/asset-type-list-header/asset-type-list-header.component';
import { AssetTypeListItemComponent } from './components/content/asset-type-list-item/asset-type-list-item.component';
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
import { AssetTypeCreateComponent } from './components/content/asset-type-create/asset-type-create.component';
import { QuantityTypeDialogContentComponent } from './components/content/quantity-type-dialog/quantity-type-dialog-content/quantity-type-dialog-content.component';
import { UnitDialogComponent } from './components/content/unit-dialog/unit-dialog.component';
import { FieldDialogContentComponent } from './components/content/field-dialog/field-dialog-content/field-dialog-content.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateCreateStepOneComponent } from './components/content/asset-type-template-create-step-one/asset-type-template-create-step-one.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateCreateStepTwoComponent } from './components/content/asset-type-template-create-step-two/asset-type-template-create-step-two.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateCreateStepThreeComponent } from './components/content/asset-type-template-create-step-three/asset-type-template-create-step-three.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateCreateStepFourComponent } from './components/content/asset-type-template-create-step-four/asset-type-template-create-step-four.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateFieldRowComponent } from './components/content/asset-type-template-field-row/asset-type-template-field-row.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateCreateStepSumaryComponent } from './components/content/asset-type-template-create-step-sumary/asset-type-template-create-step-sumary.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { AssetTypePageComponent } from './components/pages/asset-type-page/asset-type-page.component';
import { AssetTypeEditComponent } from './components/content/asset-type-edit/asset-type-edit.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { QuantityTypePageComponent } from './components/pages/quantity-type-page/quantity-type-page.component';
import { CheckboxModule } from 'primeng/checkbox';
import { IFCommon } from '../common/i-f-common.module';
import { QuantityTypeEditDialogDirective } from './components/content/quantity-type-dialog/quantity-type-edit-dialog.directive';
import { DialogService } from 'primeng/dynamicdialog';
import { FieldDialogDirective } from './components/content/field-dialog/field-dialog.directive';
import { FieldPageComponent } from './components/pages/field-page/field-page.component';
import { AccuracyFormatPipe } from '../pipes/accuracyformat.pipe';
import { UnitPageComponent } from './components/pages/unit-page/unit-page.component';

@NgModule({
  declarations: [
    AssetTypeTemplatePageComponent,
    AssetTypeTemplateListHeaderComponent,
    AssetTypeTemplateListItemComponent,
    ArraySortPipe,
    AssetTypeTemplateListComponent,
    AssetTypeTemplateEditComponent,
    AssetTypeTemplateCreateComponent,
    EcosystemSubHeaderComponent,
    EcosystemPageTitleComponent,
    FieldsPageComponent,
    QuantityTypesPageComponent,
    UnitPageComponent,
    UnitsPageComponent,
    AssetTypesPageComponent,
    AssetTypeListComponent,
    AssetTypeListHeaderComponent,
    AssetTypeListItemComponent,
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
    AssetTypeCreateComponent,
    QuantityTypeDialogContentComponent,
    FieldDialogContentComponent,
    UnitDialogComponent,
    AssetTypeTemplateCreateStepOneComponent,
    AssetTypeTemplateCreateStepTwoComponent,
    AssetTypeTemplateCreateStepThreeComponent,
    AssetTypeTemplateCreateStepFourComponent,
    AssetTypeTemplateFieldRowComponent,
    AssetTypeTemplateCreateStepSumaryComponent,
    AssetTypePageComponent,
    AssetTypeEditComponent,
    QuantityTypePageComponent,
    QuantityTypeEditDialogDirective,
    FieldDialogDirective,
    FieldPageComponent,
    AccuracyFormatPipe,
  ],
  imports: [
    IFCommon,
    CommonModule,
    EcosystemRoutingModule,
    ClarityModule,
    FontAwesomeModule,
    FormsModule,
    Ng2CompleterModule,
    ReactiveFormsModule,
    DialogModule,
    TableModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    RadioButtonModule,
    CheckboxModule
  ],
  exports: [
    EcosystemSubHeaderComponent,
    EcosystemPageTitleComponent,
  ],
  providers: [
    DialogService
  ]
})
export class EcosystemModule {
}
