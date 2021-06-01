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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListComponent } from '../base/base-list/base-list.component';
import { FieldQuery } from '../../../../store/field/field-query.service';
import { FieldService } from '../../../../store/field/field.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { FieldDialogComponent } from '../field-dialog/field-dialog.component';
import { Field } from '../../../../store/field/field.model';

@Component({
  selector: 'app-field-list',
  templateUrl: './field-list.component.html',
  styleUrls: ['./field-list.component.scss'],
  providers: [DialogService]
})
export class FieldListComponent extends BaseListComponent implements OnInit, OnDestroy {

  public titleMapping:
  { [k: string]: string} = { '=0': 'No Metrics & Attributes', '=1': '# Metric & Attribute', other: '# Metrics & Attributes' };

  public editBarMapping:
    { [k: string]: string } = {
      '=0': 'No metrics & attributes selected',
      '=1': '# metric or attribute selected',
      other: '# metrics or attributes selected'
    };

  private fieldForm: FormGroup;

  constructor(public route: ActivatedRoute,
              public router: Router,
              public fieldQuery: FieldQuery,
              public fieldService: FieldService,
              public dialogService: DialogService,
              private formBuilder: FormBuilder) {
    super(route, router, fieldQuery, fieldService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.fieldQuery.resetError();
  }

  showCreateDialog() {
    this.createFieldForm(this.formBuilder);
    const ref = this.dialogService.open(FieldDialogComponent, {
      data: {
        fieldForm: this.fieldForm,
        isEditing: false
      },
      header: `Create new Metric or Attribute`,
    });

    ref.onClose.subscribe((field: Field) => this.onCloseCreateDialog(field));
  }

  createFieldForm(formBuilder: FormBuilder) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];

    this.fieldForm = formBuilder.group({
      id: [],
      name: ['', requiredTextValidator],
      label: ['', requiredTextValidator],
      description: ['', Validators.maxLength(255)],
      accuracy: [0],
      baseUnit: [null, Validators.required],
      quantityTypeId: [null, Validators.required],
      symbol: ['', [Validators.required, Validators.maxLength(1), Validators.maxLength(4)]] // TODO: Max symbol length
    });
  }

  onCloseCreateDialog(item: Field) {
    if (item) {
      this.fieldService.createItem(item).subscribe();
      this.fieldService.setActive(item.id);
      // this.updateUI(item);
    }
  }

}
