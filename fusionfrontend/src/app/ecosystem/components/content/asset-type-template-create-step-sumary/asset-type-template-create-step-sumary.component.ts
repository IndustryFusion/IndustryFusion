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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-asset-type-template-create-step-sumary',
  templateUrl: './asset-type-template-create-step-sumary.component.html',
  styleUrls: ['./asset-type-template-create-step-sumary.component.scss']
})
export class AssetTypeTemplateCreateStepSumaryComponent implements OnInit {

  constructor(public route: ActivatedRoute, public router: Router) { }

  ngOnInit() {
  }

  return() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
