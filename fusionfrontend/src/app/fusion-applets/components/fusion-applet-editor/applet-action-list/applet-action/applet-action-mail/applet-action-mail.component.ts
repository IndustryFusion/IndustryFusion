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

import { Component, Input, OnInit } from '@angular/core';
import { OispService } from '../../../../../../services/api/oisp.service';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-applet-action-mail',
  templateUrl: './applet-action-mail.component.html',
  styleUrls: ['./applet-action-mail.component.scss']
})
export class AppletActionMailComponent implements OnInit {

  @Input()
  emailAction: FormGroup;

  emailRecipients: string[] = [];
  emailSelection: string;
  accordionIndex = -1;

  constructor(oispService: OispService) {
    oispService.getUsers().subscribe(users => this.emailRecipients = users.map(user => user.email));
  }

  ngOnInit(): void {
    const target = this.emailAction.get('target') as FormArray;
    for (let i = 0; i < target.controls.length; i++) {
      if (!target.controls[i].value) {
        target.removeAt(i);
      }
    }
  }

  addEmail(email: string) {
    (this.emailAction.get('target') as FormArray).push(new FormControl(email));
  }

  removeEmail(emailIndex: number) {
    (this.emailAction.get('target') as FormArray).removeAt(emailIndex);
    this.emailSelection = null;
  }

  getTarget(): AbstractControl[] {
    return (this.emailAction?.get('target') as FormArray).controls;
  }

  getAvailableRecipients(): string[] {
    return this.emailRecipients.filter(mail => !this.emailAction.get('target').value.includes(mail));
  }

  close() {
    this.accordionIndex = -1;
  }
}
