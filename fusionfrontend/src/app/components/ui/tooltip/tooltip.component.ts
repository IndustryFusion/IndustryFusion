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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit, OnDestroy {

  @Input() component: any;
  private dialogRef: DynamicDialogRef = null;
  private clicked = false;

  constructor(private dialogService: DialogService) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.dialogRef?.close();
  }

  onHoverStart() {
    this.showDialog();
  }

  onHoverEnd() {
    if (!this.clicked) {
      this.dialogRef?.close();
      this.dialogRef = null;
    }
  }

  private showDialog() {
    if (!this.dialogRef) {
      this.dialogRef = this.dialogService.open(this.component, { header: '', modal: false });
      this.dialogRef.onClose.subscribe(() => this.reset());
    }
  }

  private reset() {
    this.dialogRef = null;
    this.clicked = false;
  }

  onClick() {
    this.clicked = true;
    this.showDialog();
  }
}
