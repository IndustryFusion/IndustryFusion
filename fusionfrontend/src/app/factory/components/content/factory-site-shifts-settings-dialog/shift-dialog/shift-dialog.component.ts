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
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Minutes } from '../../../../../core/store/factory-site/factory-site.model';
import { CustomFormValidators } from '../../../../../core/validators/custom-form-validators';
import { DialogType } from '../../../../../shared/models/dialog-type.model';

@Component({
  selector: 'app-shift-dialog',
  templateUrl: './shift-dialog.component.html',
  styleUrls: ['./shift-dialog.component.scss']
})
export class ShiftDialogComponent implements OnInit {

  shiftForm: FormGroup;
  type: DialogType;

  readonly MINUTES_PER_DAY = 24 * 60 - 1;

  DialogType = DialogType;

  private static convertTimeStringToMinutes(timeString: string): number {
    if (!CustomFormValidators.isTimeStringValid(timeString)) {
      console.warn('[shift dialog]: Invalid timeString parameter');
      return -1;
    }

    const timeStringParts: string[] = timeString.split(':');
    const hours = parseInt(timeStringParts[0], 10);
    const minutes = timeStringParts.length > 1 ? parseInt(timeStringParts[1], 10) : 0;
    return hours * 60 + minutes;
  }

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig) {
  }

  ngOnInit() {
    this.validateConfigData();
    this.initFromConfig();
    this.extendShiftForm();
  }

  private validateConfigData() {
    if (!this.config.data.shiftForm) {
      console.warn('[shift dialog]: Shift form is missing');
    }
    if (this.config.data.type == null) {
      console.warn('[shift dialog]: Dialog type is missing');
    }
  }

  private initFromConfig(): void {
    this.shiftForm = this.config.data.shiftForm;
    this.type = this.config.data.type;
  }

  private extendShiftForm() {
    const minuteValidators = [Validators.min(0), Validators.max(this.MINUTES_PER_DAY), Validators.required];
    this.shiftForm.addControl('startTimeString', new FormControl(null, CustomFormValidators.requiredTimeFormat()));
    this.shiftForm.addControl('endTimeString', new FormControl(null, CustomFormValidators.requiredTimeFormat()));
    this.shiftForm.addControl('range', new FormControl(null, minuteValidators));

    this.shiftForm.get('range').valueChanges.subscribe(range => this.updateStartAndEndTime(range));
    this.updateTimeStrings();
    this.updateRange();
  }

  private updateStartAndEndTime(range: Minutes[]) {
    if (range?.length !== 2) {
      console.error('[shift dialog]: Invalid range ', range);
      return;
    }

    this.shiftForm.get('startMinutes').setValue(range[0]);
    this.shiftForm.get('endMinutes').setValue(range[1]);
    this.updateTimeStrings();
  }

  private updateTimeStrings() {
    this.shiftForm.get('startTimeString').setValue(this.convertMinutesToTimeString(this.shiftForm.get('startMinutes').value));
    this.shiftForm.get('endTimeString').setValue(this.convertMinutesToTimeString(this.shiftForm.get('endMinutes').value));
  }

  private updateRange() {
    this.shiftForm.get('range').setValue([this.shiftForm.get('startMinutes').value, this.shiftForm.get('endMinutes').value]);
  }

  private convertMinutesToTimeString(totalMinutes: Minutes): string {
    if (totalMinutes < 0 || totalMinutes > this.MINUTES_PER_DAY) {
      console.error('[add shift dialog]: Invalid totalMinutes parameter: ', totalMinutes);
      return '';
    }

    const hours = Math.floor(totalMinutes / 60.0);
    const minutes = totalMinutes % 60;
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  }

  onCancel(): void {
    this.reduceShiftForm();
    this.ref.close();
  }

  onSave(): void {
    this.reduceShiftForm();
    this.ref.close(this.shiftForm);
  }

  private reduceShiftForm() {
    this.shiftForm.removeControl('startTimeString');
    this.shiftForm.removeControl('endTimeString');
    this.shiftForm.removeControl('range');
  }

  onStartTimeStringChange(): void {
    const startMinutes: Minutes = ShiftDialogComponent.convertTimeStringToMinutes(this.shiftForm.get('startTimeString').value);
    this.shiftForm.get('startMinutes').setValue(startMinutes);
    this.updateRange();
  }

  onEndTimeStringChange(): void {
    const endMinutes: Minutes = ShiftDialogComponent.convertTimeStringToMinutes(this.shiftForm.get('endTimeString').value);
    this.shiftForm.get('endMinutes').setValue(endMinutes);
    this.updateRange();
  }
}
