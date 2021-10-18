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

import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({ name: 'germanNumber' })
export class GermanNumberPipe implements PipeTransform {

  constructor() { }

  private static isNumber(value: any): boolean {
    return !Number.isNaN(Number(value));
  }

  transform(value: any, format?: string) {
    if (value == null) { return ''; } // !value would also react to zeros.
    if (!format) { format = '.0-2'; }

    return GermanNumberPipe.isNumber(value) ? formatNumber(value, 'de-de', format) : String(value);
  }
}
