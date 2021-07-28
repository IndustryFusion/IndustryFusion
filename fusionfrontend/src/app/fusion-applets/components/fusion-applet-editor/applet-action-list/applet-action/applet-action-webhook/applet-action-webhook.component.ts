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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-applet-action-webhook',
  templateUrl: './applet-action-webhook.component.html',
  styleUrls: ['./applet-action-webhook.component.scss']
})
export class AppletActionWebhookComponent implements OnInit {

  activeHeaderGroup: FormGroup;
  headers: Map<string, string> = new Map<string, string>();

  constructor(private formBuilder: FormBuilder) {
    this.activeHeaderGroup = this.getHeaderGroup();
  }

  ngOnInit(): void {
  }

  addHeader() {
    const rawValue: { name: string, value: string} = this.activeHeaderGroup.getRawValue();
    this.headers.set(rawValue.name, rawValue.value);
    this.activeHeaderGroup = this.getHeaderGroup();
  }

  removeHeader(headerKey: string) {
    this.headers.delete(headerKey);
  }

  private getHeaderGroup(): FormGroup {
    return this.formBuilder.group({
      name: [, [Validators.required]],
      value: []
    });
  }
}
