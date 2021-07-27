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
import { OispService } from '../../../../services/oisp.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-applet-action',
  templateUrl: './applet-action.component.html',
  styleUrls: ['./applet-action.component.scss']
})
export class AppletActionComponent implements OnInit {

  activeAccordionIndex = 0;
  emailRecipients: string[] = [];
  selectedEmailRecipients: string[] = [];
  emailSelection: string;
  headers: FormGroup[] = [];
  activeHeaderGroup: FormGroup;

  constructor(oispService: OispService, private formBuilder: FormBuilder) {
    oispService.getUser().subscribe(users => this.emailRecipients = users.map(user => user.email));
    this.activeHeaderGroup = this.getHeaderGroup();
  }



  ngOnInit(): void {
  }

  addEmail(email: string) {
    this.selectedEmailRecipients.push(email);
    this.selectedEmailRecipients = this.selectedEmailRecipients.slice();
    this.emailRecipients = this.emailRecipients.filter(mail => mail.localeCompare(email));
  }

  removeEmail(emailIndex: number) {
    this.emailRecipients.push(this.selectedEmailRecipients[emailIndex]);
    this.emailRecipients = this.emailRecipients.slice();
    this.selectedEmailRecipients.splice(emailIndex, 1);
    this.emailSelection = null;
  }

  private getHeaderGroup(): FormGroup {
    return this.formBuilder.group({
      name: [, [Validators.required]],
      value: []
    });
  }

  addHeader() {
    this.headers.push(this.activeHeaderGroup);
    this.headers = this.headers.slice();
    this.activeHeaderGroup = this.getHeaderGroup();
  }

  removeHeader(headerIndex: number) {
    this.headers.splice(headerIndex, 1);
  }
}
