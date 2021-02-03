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

import { Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-asset-series-create-step-one',
  templateUrl: './asset-series-create-step-one.component.html',
  styleUrls: ['./asset-series-create-step-one.component.scss']
})
export class AssetSeriesCreateStepOneComponent {

  @Output() stepChange = new EventEmitter<number>();

  name: string;
  description: string;

  lorem: string = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod ' +
    'tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.';

}
