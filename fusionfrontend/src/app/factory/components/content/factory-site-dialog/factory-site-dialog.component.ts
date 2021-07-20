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
    this.factorySite = { ...this.factorySite, ...this.factorySiteForm.value };
    this.factorySite.country = this.countryQuery.getEntity(this.factorySite.countryId);
    this.formChange = this.factorySiteForm.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.factorySite = { ...this.factorySite, ...this.factorySiteForm.value };
      this.factorySite.country = this.countryQuery.getEntity(this.factorySite.countryId);
    });
    this.createCountriesItems();
  }

  onCancel() {
    this.ref.close();
  }

  onSave() {
    if (this.factorySiteForm.valid) {

      this.factorySite.id = this.factorySiteForm.get('id')?.value;
      this.factorySite.name = this.factorySiteForm.get('name')?.value;
      this.factorySite.type = this.factorySiteForm.get('type')?.value;
      this.factorySite.line1 = this.factorySiteForm.get('line1')?.value;
      this.factorySite.line2 = this.factorySiteForm.get('line2')?.value;
      this.factorySite.zip = this.factorySiteForm.get('zip')?.value;
      this.factorySite.city = this.factorySiteForm.get('city')?.value;
      this.factorySite.countryId = this.factorySiteForm.get('countryId')?.value;

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
