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

import { AbstractControl, FormArray, FormGroup, Validators } from '@angular/forms';

export class WizardHelper {
  public static readonly MAX_TEXT_LENGTH = 255;
  public static readonly requiredTextValidator = [Validators.required, Validators.minLength(1),
    Validators.maxLength(WizardHelper.MAX_TEXT_LENGTH)];
  public static readonly maxTextLengthValidator = [Validators.maxLength(WizardHelper.MAX_TEXT_LENGTH)];

  public static removeItemFromFormAndDataArray(group: FormGroup,
                                               formArray: FormArray, formArrayIndexPath: string,
                                               dataArray: any[], dataArrayIndexPath: string): void {

    if (WizardHelper.isArgumentsInvalid(group, formArray, formArrayIndexPath, dataArray, dataArrayIndexPath) ) {
      console.error('[wizard helper]: invalid arguments');
    }

    const indexDataArray: number = group.get(dataArrayIndexPath).value;
    dataArray.splice(indexDataArray, 1);

    const indexFormArray: number = group.get(formArrayIndexPath).value;
    formArray.removeAt(indexFormArray);

    WizardHelper.updateFormAndDataArrayIndices(formArray, formArrayIndexPath, indexFormArray, dataArrayIndexPath);
  }

  private static isArgumentsInvalid(group: FormGroup,
                                    formArray: FormArray,
                                    formArrayIndexPath: string,
                                    dataArray: any[],
                                    dataArrayIndexPath: string): boolean {
    return group == null || formArray == null || dataArray == null
     || formArrayIndexPath == null || dataArrayIndexPath == null;
  }

  private static updateFormAndDataArrayIndices(formArray: FormArray, formArrayIndexPath: string, indexFormArray: number,
                                               dataArrayIndexPath: string): void {
    if (indexFormArray < 0) {
      console.error('[wizard helper]: Index out of bounds: ', indexFormArray);
    }

    for (let i = indexFormArray; i < formArray.length; i++) {
      const indexInArrayElement = formArray.at(i).get(formArrayIndexPath);
      const indexInFieldInstancesElement = formArray.at(i).get(dataArrayIndexPath);
      indexInArrayElement.setValue(indexInArrayElement.value - 1);
      indexInFieldInstancesElement.setValue(indexInFieldInstancesElement.value - 1);
    }
  }

  public static removeSubsystemFromFormArray(subsystemGroup: AbstractControl, subsystemFormArray: FormArray): number {
    if (subsystemGroup) {
      const subsystemId = subsystemGroup.get('id').value;
      const indexToRemove = subsystemGroup.get('index').value;
      subsystemFormArray.removeAt(indexToRemove);

      for (let i = indexToRemove; i < subsystemFormArray.length; i++) {
        const indexElement = subsystemFormArray.at(i).get('index');
        indexElement.setValue(indexElement.value - 1);
      }

      return subsystemId;
    }

    return null;
  }
}
