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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetWizardStep } from '../asset-wizard-step.model';
import { CountryQuery } from '../../../../../../store/country/country.query';
import { SelectItem } from 'primeng/api';
import { Asset } from '../../../../../../store/asset/asset.model';
import { CustomFormValidators } from '../../../../../../common/utils/custom-form-validators';

@Component({
  selector: 'app-asset-wizard-step-customer',
  templateUrl: './asset-wizard-step-customer.component.html',
  styleUrls: ['./asset-wizard-step-customer.component.scss']
})
export class AssetWizardStepCustomerComponent implements OnInit {

  @Input() asset: Asset;
  @Output() stepChange = new EventEmitter<number>();

  public countries: SelectItem[] = [];
  public factorySiteForm: FormGroup;

  constructor(private countryQuery: CountryQuery,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.countryQuery.selectCountries().subscribe(
      countries => {
        for (const country of countries) {
          this.countries.push({ label: country.name, value: country.id });
        }
      }
    );

    this.createFactorySiteForm();
  }

  private createFactorySiteForm() {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    const companyId = this.asset.companyId;
    const countryIdGermany = this.countries.find(item => item.label === 'Germany').value;

    this.factorySiteForm = this.formBuilder.group({
      id: [],
      name: [null, requiredTextValidator],
      street: [null, Validators.maxLength(255)],
      zip: [null, requiredTextValidator],
      city: [null, [Validators.maxLength(255), CustomFormValidators.requiredZip]],
      countryId: [countryIdGermany, Validators.required],
      companyId: [companyId, Validators.required]
    });
  }

  public onBack(): void {
    this.stepChange.emit(AssetWizardStep.CUSTOMER_DATA - 1);
  }

  public onNext(): void {
    this.stepChange.emit(AssetWizardStep.CUSTOMER_DATA + 1);
  }

}
