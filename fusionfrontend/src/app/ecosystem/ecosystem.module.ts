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
import { MetricsAttributesPageComponent } from './components/pages/metrics-attributes-page/metrics-attributes-page.component';
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
import { MetricListComponent } from './components/content/metric-list/metric-list.component';
import { MetricListHeaderComponent } from './components/content/metric-list-header/metric-list-header.component';
import { MetricListItemComponent } from './components/content/metric-list-item/metric-list-item.component';
import { QuantityTypeListComponent } from './components/content/quantity-type-list/quantity-type-list.component';
import { QuantityTypeListHeaderComponent } from './components/content/quantity-type-list-header/quantity-type-list-header.component';
import { QuantityTypeListItemComponent } from './components/content/quantity-type-list-item/quantity-type-list-item.component';
import { UnitListComponent } from './components/content/unit-list/unit-list.component';
import { UnitListHeaderComponent } from './components/content/unit-list-header/unit-list-header.component';
import { UnitListItemComponent } from './components/content/unit-list-item/unit-list-item.component';
import { AssetTypeCreateComponent } from './components/content/asset-type-create/asset-type-create.component';
import { QuantityTypeUpdateComponent } from './components/content/quantity-type-update/quantity-type-update.component';
import { UnitCreateComponent } from './components/content/unit-create/unit-create.component';
import { MetricCreateComponent } from './components/content/metric-create/metric-create.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateCreateStepOneComponent } from './components/content/asset-type-template-create-step-one/asset-type-template-create-step-one.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateCreateStepTwoComponent } from './components/content/asset-type-template-create-step-two/asset-type-template-create-step-two.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateCreateStepThreeComponent } from './components/content/asset-type-template-create-step-three/asset-type-template-create-step-three.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateCreateStepFourComponent } from './components/content/asset-type-template-create-step-four/asset-type-template-create-step-four.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateMetricRowComponent } from './components/content/asset-type-template-metric-row/asset-type-template-metric-row.component';
// tslint:disable-next-line:max-line-length
import { AssetTypeTemplateCreateStepSumaryComponent } from './components/content/asset-type-template-create-step-sumary/asset-type-template-create-step-sumary.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { AssetTypePageComponent } from './components/pages/asset-type-page/asset-type-page.component';
import { AssetTypeEditComponent } from './components/content/asset-type-edit/asset-type-edit.component';
import { CreateButtonComponent } from '../components/ui/create-button/create-button.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';

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
    MetricsAttributesPageComponent,
    QuantityTypesPageComponent,
    UnitsPageComponent,
    AssetTypesPageComponent,
    AssetTypeListComponent,
    AssetTypeListHeaderComponent,
    AssetTypeListItemComponent,
    BaseListComponent,
    BaseListHeaderComponent,
    BaseListItemComponent,
    MetricListComponent,
    MetricListHeaderComponent,
    MetricListItemComponent,
    QuantityTypeListComponent,
    QuantityTypeListHeaderComponent,
    QuantityTypeListItemComponent,
    UnitListComponent,
    UnitListHeaderComponent,
    UnitListItemComponent,
    AssetTypeCreateComponent,
    QuantityTypeUpdateComponent,
    UnitCreateComponent,
    MetricCreateComponent,
    AssetTypeTemplateCreateStepOneComponent,
    AssetTypeTemplateCreateStepTwoComponent,
    AssetTypeTemplateCreateStepThreeComponent,
    AssetTypeTemplateCreateStepFourComponent,
    AssetTypeTemplateMetricRowComponent,
    AssetTypeTemplateCreateStepSumaryComponent,
    AssetTypePageComponent,
    AssetTypeEditComponent,
    CreateButtonComponent,
  ],
  imports: [
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
    DropdownModule
  ],
  exports: [
    EcosystemSubHeaderComponent,
    EcosystemPageTitleComponent
  ]
})
export class EcosystemModule { }
