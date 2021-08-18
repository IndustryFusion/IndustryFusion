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

import { FormArray, FormGroup } from '@angular/forms';

export class WizardHelper {
  public static removeItemFromFormAndDataArray(group: FormGroup,
                                               formArray: FormArray, formArrayIndexPath: string,
                                               dataArray: any[], dataArrayIndexPath: string): void {
    const indexDataArray: number = group.get(dataArrayIndexPath).value;
    dataArray.splice(indexDataArray, 1);

    const indexFormArray: number = group.get(formArrayIndexPath).value;
    formArray.removeAt(indexFormArray);

    WizardHelper.updateFormAndDataArrayIndices(formArray, formArrayIndexPath, indexFormArray, dataArrayIndexPath);
  }

  private static updateFormAndDataArrayIndices(formArray: FormArray, formArrayIndexPath: string, indexFormArray: number,
                                               dataArrayIndexPath: string): void {
    for (let i = indexFormArray; i < formArray.length; i++) {
      const indexInArrayElement = formArray.at(i).get(formArrayIndexPath);
      const indexInFieldInstancesElement = formArray.at(i).get(dataArrayIndexPath);
      indexInArrayElement.setValue(indexInArrayElement.value - 1);
      indexInFieldInstancesElement.setValue(indexInFieldInstancesElement.value - 1);
    }
  }
}
