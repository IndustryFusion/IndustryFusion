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
import { FactorySite, Shift, ShiftSettings, ShiftsOfDay } from 'src/app/core/store/factory-site/factory-site.model';
import { SelectItem } from 'primeng/api';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogType } from '../../../../shared/models/dialog-type.model';
import { TranslateService } from '@ngx-translate/core';
import { Day } from '../../../../core/models/days.model';
import { ItemOptionsMenuType } from 'src/app/shared/components/ui/item-options-menu/item-options-menu.type';
import { ShiftDialogComponent } from './shift-dialog/shift-dialog.component';
import { WizardHelper } from '../../../../core/helpers/wizard-helper';
import { FactorySiteService } from '../../../../core/store/factory-site/factory-site.service';
import { CompanyQuery } from '../../../../core/store/company/company.query';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-factory-site-shift-settings-dialog',
  templateUrl: './factory-site-shift-settings-dialog.component.html',
  styleUrls: ['./factory-site-shift-settings-dialog.component.scss']
})

export class FactorySiteShiftSettingsDialogComponent implements OnInit {

  shiftSettingsForm: FormGroup;
  weekdays: SelectItem[];
  factorySite: FactorySite;
  type: DialogType;

  ItemOptionsMenuType = ItemOptionsMenuType;

  private readonly MAX_SHIFTS_PER_DAY = 3;
  private readonly MAX_MINUTES_PER_DAY = 24 * 60 - 1;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private companyQuery: CompanyQuery,
    private factorySiteService: FactorySiteService,
    private translate: TranslateService) {

    this.weekdays = [
      { label: this.translate.instant('APP.COMMON.DAYS.MONDAY'), value: Day.MONDAY },
      { label: this.translate.instant('APP.COMMON.DAYS.TUESDAY'), value: Day.TUESDAY },
      { label: this.translate.instant('APP.COMMON.DAYS.WEDNESDAY'), value: Day.WEDNESDAY },
      { label: this.translate.instant('APP.COMMON.DAYS.THURSDAY'), value: Day.THURSDAY },
      { label: this.translate.instant('APP.COMMON.DAYS.FRIDAY'), value: Day.FRIDAY },
      { label: this.translate.instant('APP.COMMON.DAYS.SATURDAY'), value: Day.SATURDAY },
      { label: this.translate.instant('APP.COMMON.DAYS.SUNDAY'), value: Day.SUNDAY }
    ];
  }

  ngOnInit() {
    this.validateConfigData();
    this.initFromConfig();
    this.resolve().subscribe(factorySite => {
      this.factorySite = factorySite;
      this.initShiftSettingsFormGroup();
    });
  }

  private validateConfigData() {
    if (!this.config.data.factorySite) {
      console.warn('[factory site shifts dialog]: Factory site is missing');
    } else if (!this.config.data.factorySite.shiftSettings && !this.config.data.factorySite.shiftSettingsId) {
      console.warn('[factory site shifts dialog]: Shift Settings are missing');
    }
  }

  private initFromConfig(): void {
    this.factorySite = this.config.data.factorySite ? { ...this.config.data.factorySite } : null;
  }

  private resolve(): Observable<FactorySite> {
    if (!this.factorySite.shiftSettings) {
      const companyId = this.companyQuery.getActiveId();
      return this.factorySiteService.getFactorySiteWithShiftsSettings(companyId, this.factorySite.id);
    } else {
      return of(this.factorySite);
    }
  }

  private initShiftSettingsFormGroup(): void {
    this.shiftSettingsForm = this.formBuilder.group({
      id: [],
      version: [],
      factorySiteId: [],
      weekStart: [Day.MONDAY, Validators.required],
      shiftsOfDays: this.createShiftsOfWeekFormArray()
    });

    if (this.factorySite.shiftSettings) {
      this.shiftSettingsForm.patchValue(this.factorySite.shiftSettings);
    }
  }

  private createShiftsOfWeekFormArray(): FormArray {
    const shiftsOfWeekFormArray = new FormArray([]);

    const shiftsOfDays = this.factorySite.shiftSettings.shiftsOfDays;
    for (const shiftsOfDay of shiftsOfDays) {
      const formGroup = this.createSingleDayFormGroup(shiftsOfWeekFormArray.length, shiftsOfDay);
      shiftsOfWeekFormArray.push(formGroup);
    }

    return shiftsOfWeekFormArray;
  }

  private createSingleDayFormGroup(indexInArray: number,
                                   shiftsOfDay: ShiftsOfDay): FormGroup {
    return this.formBuilder.group({
      id: [],
      version: [],
      day: [shiftsOfDay.day, Validators.required],
      isActive: [shiftsOfDay.isActive, Validators.required],
      indexInArray: [indexInArray],
      shifts: this.createShiftsOfDayFormArray(shiftsOfDay)
    });
  }

  private createShiftsOfDayFormArray(shiftsOfDay: ShiftsOfDay): FormArray {
    const shiftsOfDayFormArray = new FormArray([]);
    for (const shift of shiftsOfDay.shifts) {
      const formGroup = this.createSingleShiftOfDayFormGroup(shiftsOfDay.day, shiftsOfDayFormArray.length, shift);
      shiftsOfDayFormArray.push(formGroup);
    }
    return shiftsOfDayFormArray;
  }

  private createSingleShiftOfDayFormGroup(day: Day,
                                          indexInArray: number,
                                          shift: Shift): FormGroup {
    const minuteValidators = [Validators.min(0), Validators.max(this.MAX_MINUTES_PER_DAY), Validators.required];
    const shiftForm = this.formBuilder.group({
      id: [],
      version: [],
      day: [day],
      indexInArray: [indexInArray],
      name: [null, WizardHelper.requiredTextValidator],
      startMinutes: [null, minuteValidators],
      endMinutes: [null, minuteValidators]
    });

    if (shift) {
      shiftForm.patchValue(shift);
    }

    return shiftForm;
  }

  onCancel(): void {
    this.ref.close();
  }

  onSave(): void {
    if (this.shiftSettingsForm.valid) {
      this.removeNotSavedAttributesInForms();
      this.factorySite.shiftSettings = this.shiftSettingsForm.getRawValue() as ShiftSettings;
      this.update();

      this.ref.close(this.factorySite);
    }
  }

  private removeNotSavedAttributesInForms() {
    for (const daysFormGroup of this.getDaysFormGroups()) {
      daysFormGroup.removeControl('indexInArray');
      for (const shiftsFormGroup of this.getShiftsOfDayFormGroups(daysFormGroup)) {
        shiftsFormGroup.removeControl('day');
      }
    }
  }

  private update() {
    this.factorySiteService.updateFactorySite(this.factorySite).subscribe(
      error => console.error('[factory site shifts dialog]: ' + error)
    );
  }

  onAddShift(day: Day): void {
    const shiftOfDayFormGroup: FormGroup = this.getDaysFormGroups().find(x => x.get('day').value === day);
    const shiftsFormArray: FormArray = shiftOfDayFormGroup?.controls.shifts as FormArray;

    if (shiftOfDayFormGroup && shiftsFormArray && !this.isMaxShiftsOfDayReached(shiftOfDayFormGroup))
    {
      const emptyShift = new Shift('', 6 * 60, 14 * 60 + 45);
      const emptyShiftForm = this.createSingleShiftOfDayFormGroup(day, shiftsFormArray.length, emptyShift);
      this.openShiftDialog(emptyShiftForm, DialogType.CREATE)
        .onClose.subscribe(newShiftForm => {
        if (newShiftForm) {
          shiftsFormArray.push(newShiftForm);
        }
      });
    }
  }

  onEditShift(shiftForm: FormGroup): void {
    const copiedShiftFormValueForRollback = { ...shiftForm.value };
    this.openShiftDialog(shiftForm, DialogType.EDIT)
      .onClose.subscribe(updatedShiftForm => {
      if (!updatedShiftForm) {
        shiftForm.setValue(copiedShiftFormValueForRollback);
      }
    });
  }

  private openShiftDialog(shiftForm: FormGroup, type: DialogType): DynamicDialogRef {
    return this.dialogService.open(ShiftDialogComponent, {
      data: { type, shiftForm },
      header: this.translate.instant(`APP.FACTORY.SHIFTS_DIALOG.${type === DialogType.EDIT ? 'EDIT_SHIFT' : 'ADD_SHIFT'}`),
      width: '20%',
      contentStyle: { 'padding-left': '8%', 'padding-right': '8%' },
    });
  }

  onDeleteShift(shiftForm: FormGroup): void {
    if (shiftForm) {
      const shiftOfDayFormGroup: FormGroup = this.getDaysFormGroups().find(x => x.get('day').value === shiftForm.get('day').value);
      const shiftsFormArray: FormArray = shiftOfDayFormGroup?.controls.shifts as FormArray;
      shiftsFormArray.removeAt(shiftForm.get('indexInArray').value);
    }
  }

  getDaysFormGroups(): FormGroup[] {
    const daysFormArray: FormArray = this.shiftSettingsForm.controls.shiftsOfDays as FormArray;
    return daysFormArray.controls as FormGroup[];
  }

  getShiftsOfDayFormGroups(dayFormGroup: FormGroup): FormGroup[] {
    const shiftsOfDayFormArray: FormArray = dayFormGroup.controls.shifts as FormArray;
    return shiftsOfDayFormArray.controls as FormGroup[];
  }

  isMaxShiftsOfDayReached(dayFormGroup: FormGroup): boolean {
    return this.getShiftsOfDayFormGroups(dayFormGroup).length >= this.MAX_SHIFTS_PER_DAY;
  }

  toggleIsDayActive(dayFormGroup: FormGroup): void {
    dayFormGroup.get('isActive').setValue(!dayFormGroup.get('isActive').value);
  }
}
