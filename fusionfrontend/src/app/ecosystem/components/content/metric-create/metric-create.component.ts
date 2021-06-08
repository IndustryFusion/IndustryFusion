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

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ID } from '@datorama/akita';

import { Observable } from 'rxjs';

import { Unit } from '../../../../store/unit/unit.model';
import { UnitQuery } from '../../../../store/unit/unit.query';
import { Metric } from '../../../../store/metric/metric.model';

@Component({
  selector: 'app-metric-create',
  templateUrl: './metric-create.component.html',
  styleUrls: ['./metric-create.component.scss']
})
export class MetricCreateComponent implements OnInit {

  name: string;
  description: string;
  label: string;
  unitId: ID;
  accuracy: number;

  units$: Observable<Unit[]>;

  @Output() dismissModalSignal = new EventEmitter<boolean>();
  @Output() confirmModalSignal = new EventEmitter<Metric>();

  constructor(private unitQuery: UnitQuery) { }

  ngOnInit() {
    this.units$ = this.unitQuery.selectAll();
  }

  dismissModal() { this.dismissModalSignal.emit(true); }

  confirmModal() {
    const metric = new Metric();
    metric.name = this.name;
    metric.description = this.description;
    metric.label = this.label;
    metric.unitId = this.unitId;
    metric.accuracy = this.accuracy;
    this.confirmModalSignal.emit(metric);
  }

}
