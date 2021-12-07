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
import { ID } from '@datorama/akita';

@Pipe({
  name: 'enumOptionToString'
})
export class EnumOptionToStringPipe implements PipeTransform {
  transform(enumOptions: FieldOption[], id: ID): string {
    if (enumOptions === null || enumOptions?.length === 0 || !id) {
      return '';
    }
    const fieldOption = enumOptions.find(option => option.id === +id);
    if (!fieldOption) {
      return '';
    }
    return fieldOption.optionLabel;
  }
}
