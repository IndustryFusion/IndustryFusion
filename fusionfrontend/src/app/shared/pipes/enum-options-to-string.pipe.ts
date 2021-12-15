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
import { FieldOption } from '../../core/store/field/field.model';

@Pipe({
  name: 'enumOptionsToString'
})
export class EnumOptionsToStringPipe implements PipeTransform {
  transform(enumOptions: FieldOption[]): string {
    if (enumOptions === null || enumOptions?.length === 0) {
      return '';
    }
    return enumOptions.map(val => val.optionLabel).join(', ');
  }
}
