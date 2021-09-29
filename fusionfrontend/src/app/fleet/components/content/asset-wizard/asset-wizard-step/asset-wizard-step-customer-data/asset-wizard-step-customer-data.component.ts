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
import { FactorySite, FactorySiteType } from '../../../../../../store/factory-site/factory-site.model';
import { Coordinate, GeocoderService } from '../../../../../../services/geocoder.service';
import { WizardHelper } from '../../../../../../common/utils/wizard-helper';

@Component({
  selector: 'app-asset-wizard-step-customer-data',
  templateUrl: './asset-wizard-step-customer-data.component.html',
  styleUrls: ['./asset-wizard-step-customer-data.component.scss']
})
export class AssetWizardStepCustomerDataComponent implements OnInit {

  @Input() asset: Asset;
  @Output() stepChange = new EventEmitter<number>();
  @Output() createAsset = new EventEmitter<void>();
  @Output() valid = new EventEmitter<boolean>();

  public countries: SelectItem[] = [];
  public factorySiteForm: FormGroup;

  constructor(private countryQuery: CountryQuery,
              private geocoderService: GeocoderService,
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

  private createFactorySiteForm(): void {
    const countryIdGermany = this.countries.find(item => item.label === 'Germany').value;

    this.factorySiteForm = this.formBuilder.group({
      id: [],
      version: [],
      companyId: [null, Validators.required],
      name: [null, WizardHelper.maxTextLengthValidator],
      line1: ['', WizardHelper.maxTextLengthValidator],
      line2: ['', WizardHelper.maxTextLengthValidator],
      zip: [null, WizardHelper.maxTextLengthValidator],
      city: [null, WizardHelper.maxTextLengthValidator],
      countryId: [countryIdGermany, Validators.required],
      type: [null, Validators.required],
      imageKey: [null],
    });

    if (this.asset.room?.factorySite) {
      this.factorySiteForm.patchValue(this.asset.room.factorySite);
    }
    this.factorySiteForm.get('type').setValue(FactorySiteType.FLEETMANAGER);
  }

  private hasNotMandatoryData(): boolean {
    const factorySite: FactorySite =  this.asset.room.factorySite;
    return factorySite.zip != null || factorySite.city != null || factorySite.name != null
      || factorySite.line1 != null || factorySite.id != null;
  }

  private save() {
    if (this.factorySiteForm.valid) {

      this.asset.room.factorySite = { ...this.factorySiteForm.getRawValue() as FactorySite };

      if (this.hasNotMandatoryData()) {
        const country = this.countryQuery.getEntity(this.factorySiteForm.get('countryId').value);
        this.asset.room.factorySite.country = { ...country};

        const factorySite = this.asset.room.factorySite;
        this.geocoderService.getGeocode(factorySite.line1, factorySite.zip, factorySite.city, factorySite.country.name,
          (coordinate: Coordinate)  => this.setCoordinateAndCreateAsset(coordinate));
      } else {
        this.asset.room = null;
        this.createAsset.emit();
      }
    }
  }

  private setCoordinateAndCreateAsset(coordinate: Coordinate) {
    this.asset.room.factorySite.latitude = coordinate.latitude;
    this.asset.room.factorySite.longitude = coordinate.longitude;
    this.createAsset.emit();
  }

  isReadyForNextStep(): boolean {
    return this.factorySiteForm.valid;
  }

  onBack(): void {
    this.stepChange.emit(AssetWizardStep.CUSTOMER_DATA - 1);
  }

  onSave(): void {
    if (this.isReadyForNextStep()) {
      this.valid.emit(this.factorySiteForm.valid);
      this.save();
    }
  }
}
