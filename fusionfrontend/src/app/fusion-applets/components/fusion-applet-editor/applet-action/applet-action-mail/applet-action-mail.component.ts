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
import { OispService } from '../../../../../services/oisp.service';
import { FormGroup } from '@angular/forms';

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

  constructor(oispService: OispService) {
    oispService.getUser().subscribe(users => this.emailRecipients = users.map(user => user.email));
  }

  ngOnInit(): void {
  }

  addEmail(email: string) {
    if (!this.emailAction.get('target').value) {
      this.emailAction.get('target').setValue([]);
    }
    this.emailAction.get('target').value.push(email);
  }

  removeEmail(emailIndex: number) {
    this.emailAction.get('target').value.splice(emailIndex, 1);
    this.emailSelection = null;
  }

  getAvaileblRecipients(): string[] {
    const result = this.emailRecipients.filter(mail => !this.emailAction.get('target').value.includes(mail));
    return result;
  }
}
