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
import { MetricQuery } from '../../../../store/metric/metric.query';
import { MetricService } from '../../../../store/metric/metric.service';

@Component({
  selector: 'app-metric-list',
  templateUrl: './metric-list.component.html',
  styleUrls: ['./metric-list.component.scss']
})
export class MetricListComponent extends BaseListComponent implements OnInit, OnDestroy {

  titleMapping:
  { [k: string]: string} = { '=0': 'No Metrics & Attributes', '=1': '# Metric & Attribute', other: '# Metrics & Attributes' };

  editBarMapping:
    { [k: string]: string } = {
      '=0': 'No metrics & attributes selected',
      '=1': '# metric or attribute selected',
      other: '# metrics or attributes selected'
    };

  constructor(public route: ActivatedRoute, public router: Router, public metricQuery: MetricQuery, public metricService: MetricService) {
    super(route, router, metricQuery, metricService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.metricQuery.resetError();
  }

}
