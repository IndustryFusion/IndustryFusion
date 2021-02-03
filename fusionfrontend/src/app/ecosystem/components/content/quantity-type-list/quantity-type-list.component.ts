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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListComponent } from '../base/base-list/base-list.component';
import { QuantityQuery } from '../../../../store/quantity/quantity.query';
import { QuantityService } from '../../../../store/quantity/quantity.service';

@Component({
  selector: 'app-quantity-type-list',
  templateUrl: './quantity-type-list.component.html',
  styleUrls: ['./quantity-type-list.component.scss']
})
export class QuantityTypeListComponent extends BaseListComponent implements OnInit, OnDestroy {

  titleMapping:
    { [k: string]: string } = { '=0': 'No Quantity Types', '=1': '# Quantity Type', other: '# Quantity Types' };

  editBarMapping:
    { [k: string]: string } = {
      '=0': 'No quantity types selected',
      '=1': '# quantity type selected',
      other: '# quantity types selected'
    };

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public quantityQuery: QuantityQuery,
    public quantityService: QuantityService) {
      super(route, router, quantityQuery, quantityService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.quantityQuery.resetError();
  }

}
