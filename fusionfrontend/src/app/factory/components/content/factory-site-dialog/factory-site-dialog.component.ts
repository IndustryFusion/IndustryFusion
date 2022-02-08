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
import { FactorySite, FactorySiteType } from 'src/app/core/store/factory-site/factory-site.model';
import { SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DialogType } from '../../../../shared/models/dialog-type.model';
import { CountryQuery } from '../../../../core/store/country/country.query';
import { CompanyQuery } from '../../../../core/store/company/company.query';
import { RoomService } from '../../../../core/store/room/room.service';
import { FactorySiteService } from '../../../../core/store/factory-site/factory-site.service';
import { CountryResolver } from '../../../../core/resolvers/country.resolver';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-factory-site-dialog',
  templateUrl: './factory-site-dialog.component.html',
  styleUrls: ['./factory-site-dialog.component.scss']
})

export class FactorySiteDialogComponent implements OnInit {

  factorySiteForm: FormGroup;
  factorySiteTypes: SelectItem[];
  countries: SelectItem[] = [];
  factorySite: FactorySite;
  type: DialogType;

  public DialogType = DialogType;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    private factorySiteService: FactorySiteService,
    private roomService: RoomService,
    private countryResolver: CountryResolver,
    private companyQuery: CompanyQuery,
    private countryQuery: CountryQuery,
    private translate: TranslateService) {

    this.factorySiteTypes = [
      { label: this.translate.instant('APP.FACTORY.FACTORY_SITE_DIALOG.FACTORY_TYPES.HEADQUARTER'), value: FactorySiteType.HEADQUARTER },
      { label: this.translate.instant('APP.FACTORY.FACTORY_SITE_DIALOG.FACTORY_TYPES.FABRICATION'), value: FactorySiteType.FABRICATION },
    ];
  }

  ngOnInit() {
    this.factorySite = this.config.data.factorySite;
    this.type = this.factorySite != null ? DialogType.EDIT : DialogType.CREATE;

    if (this.type === DialogType.CREATE) {
      this.factorySiteService.initFactorySiteDraft(this.companyQuery.getActiveId()).subscribe(factorySiteDraft => {
        this.factorySite = factorySiteDraft;
        this.resolveCountriesAndInitFormAndUpdates();
      });
    } else {
      this.resolveCountriesAndInitFormAndUpdates();
    }

    this.createCountriesItems();
  }

  private resolveCountriesAndInitFormAndUpdates() {
    this.countryResolver.resolve().subscribe(() => {
      this.createFormGroup();
      this.subscribeToCoordinateUpdates();
      this.updateAddressToChangeLongitudeAndLatitudeInMap();
    });
  }

  private updateAddressToChangeLongitudeAndLatitudeInMap() {
    this.factorySite = { ...this.factorySite, ...this.factorySiteForm.value };
    this.factorySite.country = this.countryQuery.getEntity(this.factorySite.countryId);
  }

  private createFormGroup() {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    const countryIdGermany = this.countryQuery.getAll().find(country => country.name === 'Germany').id;

    this.factorySiteForm = this.formBuilder.group({
      id: [],
      version: [],
      companyId: [],
      name: ['', requiredTextValidator],
      line1: [''],
      line2: [''],
      city: ['', requiredTextValidator],
      zip: [''],
      countryId: [this.type === DialogType.CREATE ? countryIdGermany : null, Validators.required],
      latitude: [0],
      longitude: [0],
      type: [null, requiredTextValidator],
      shiftSettings: [null, Validators.required]
    });

    if (this.factorySite) {
      if (!this.factorySite.shiftSettings) {
        this.factorySiteService.getFactorySiteWithShiftsSettings(this.companyQuery.getActiveId(), this.factorySite.id)
          .subscribe(factorySiteWithShiftsSettings => {
            this.factorySite = factorySiteWithShiftsSettings;
            this.factorySiteForm.get('shiftSettings').patchValue(this.factorySite.shiftSettings);

            if (!this.factorySite.shiftSettings) {
              console.error('[factory site dialog]: No shift settings given. Are data corrupt?');
            }
          });
      }
      this.factorySiteForm.patchValue(this.factorySite);
    }
  }

  private subscribeToCoordinateUpdates() {
    this.updateCoordinatesDelayed(this.factorySiteForm.get('line1').valueChanges);
    this.updateCoordinatesDelayed(this.factorySiteForm.get('line2').valueChanges);
    this.updateCoordinatesDelayed(this.factorySiteForm.get('zip').valueChanges);
    this.updateCoordinatesDelayed(this.factorySiteForm.get('city').valueChanges);
    this.updateCoordinatesDelayed(this.factorySiteForm.get('countryId').valueChanges);
  }

  private updateCoordinatesDelayed(s: Observable<any>): void {
    s.pipe(
        debounceTime(200)
    ).subscribe(() => {
      this.updateAddressToChangeLongitudeAndLatitudeInMap();
    });
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
      factorySite.companyId = this.companyQuery.getActiveId();
      this.factorySite = factorySite;

      if (this.type === DialogType.CREATE) {
        this.create();
      } else if (this.type === DialogType.EDIT) {
        this.edit();
      }

      this.ref.close(this.factorySite);
    }
  }

  private create() {
    this.factorySiteService.createFactorySite(this.factorySite).subscribe(newFactorySite => {
        this.roomService.getRoomsOfFactorySite(this.factorySite.companyId, newFactorySite.id).subscribe();
      },
      error => console.error(error)
    );
  }

  private edit() {
    this.factorySiteService.updateFactorySite(this.factorySite).subscribe(() => { },
      error => console.error(error)
    );
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
