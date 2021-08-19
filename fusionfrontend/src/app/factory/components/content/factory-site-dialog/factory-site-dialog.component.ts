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

import { Component, OnInit } from '@angular/core';
import { FactorySite, FactorySiteType } from 'src/app/store/factory-site/factory-site.model';
import { SelectItem } from 'primeng/api';
import { FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DialogType } from '../../../../common/models/dialog-type.model';
import { CountryQuery } from '../../../../store/country/country.query';

@Component({
  selector: 'app-factory-site-dialog',
  templateUrl: './factory-site-dialog.component.html',
  styleUrls: ['./factory-site-dialog.component.scss']
})

export class FactorySiteDialogComponent implements OnInit {

  factorySiteForm: FormGroup;
  factorySiteTypes: SelectItem[];
  countries: SelectItem[] = [];
  formChange: Subscription;
  factorySite: FactorySite;
  type: DialogType;

  public DialogType = DialogType;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private countryQuery: CountryQuery) {
    this.factorySiteTypes = [
      { label: 'Headquarter', value: FactorySiteType.HEADQUARTER },
      { label: 'Fabrication', value: FactorySiteType.FABRICATION },
    ];
  }

  ngOnInit() {
    this.factorySiteForm = this.config.data.factorySiteForm;
    this.type = this.config.data.type;
    this.updateFactorySite();
    this.formChange = this.factorySiteForm.valueChanges.pipe(
      debounceTime(200)
    ).subscribe(() => {
     this.updateFactorySite();
    });
    this.createCountriesItems();
  }

  private updateFactorySite() {
    this.factorySite = { ...this.factorySite, ...this.factorySiteForm.value };
    this.factorySite.country = this.countryQuery.getEntity(this.factorySite.countryId);
  }

  onCancel() {
    this.ref.close();
  }

  onSave() {
    if (this.factorySiteForm.valid) {
      const factorySite = this.factorySiteForm.getRawValue() as FactorySite;
      factorySite.longitude = this.factorySite.longitude;
      factorySite.latitude = this.factorySite.latitude;
      factorySite.country = this.countryQuery.getEntity(factorySite.countryId);
      this.factorySite = factorySite;

      this.ref.close(this.factorySite);
    }
  }

  private createCountriesItems() {
    this.countryQuery.selectCountries().subscribe(
      countries => {
        for (const country of countries) {
          this.countries.push({ label: country.name, value: country.id });
        }
      }
    );
  }

}
