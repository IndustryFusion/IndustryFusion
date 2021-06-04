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

import { Directive, HostListener, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldDialogContentComponent } from './field-dialog-content/field-dialog-content.component';
import { Field } from '../../../../store/field/field.model';
import { FieldService } from '../../../../store/field/field.service';

@Directive({
  selector: '[appFieldDialog]'
})
export class FieldDialogDirective implements OnDestroy {

  @Input() item: Field;

  public ref: DynamicDialogRef;
  private fieldForm: FormGroup;
  private isEditDialog: boolean;

  constructor(public dialogService: DialogService,
              private formBuilder: FormBuilder,
              public fieldService: FieldService) { }

  @HostListener('createItem') onCreateClicked() {
    this.isEditDialog = false;
    this.showDialog();
  }

  @HostListener('editItem') onEditClicked() {
    this.isEditDialog = true;
    this.showDialog();
  }

  showDialog() {
    this.initFieldForm(this.formBuilder);

    const ref = this.dialogService.open(FieldDialogContentComponent, {
      data: {
        fieldForm: this.fieldForm,
        isEditing: this.isEditDialog
      },
      header: this.isEditDialog ? 'Edit Metric or Attribute' : `Create new Metric or Attribute`,
    });

    ref.onClose.subscribe((field: Field) => this.onCloseDialog(field));
  }

  private initFieldForm(formBuilder: FormBuilder) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];

    this.fieldForm = formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      label: ['', requiredTextValidator],
      description: ['', Validators.maxLength(255)],
      accuracy: [0],
      unitId: [1, Validators.required],
    });

    if (this.isEditDialog && this.item) {
      this.fieldForm.patchValue(this.item);
    }
  }

  onCloseDialog(field: Field) {
    if (field) {
      if (this.isEditDialog) {
        this.fieldService.editItem(field.id, field).subscribe();
      } else {
        this.fieldService.createItem(field).subscribe();
      }

      this.fieldService.setActive(field.id);
    }
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
