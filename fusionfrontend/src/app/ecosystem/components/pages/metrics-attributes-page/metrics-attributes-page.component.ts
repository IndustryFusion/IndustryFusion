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
import { EcoSystemManagerResolver } from '../../../services/ecosystem-resolver.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-metrics-attributes-page',
  templateUrl: './metrics-attributes-page.component.html',
  styleUrls: ['./metrics-attributes-page.component.scss']
})
export class MetricsAttributesPageComponent implements OnInit {

  constructor(private ecoSystemManagerResolver: EcoSystemManagerResolver, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.ecoSystemManagerResolver.resolve(this.activatedRoute);
  }

}