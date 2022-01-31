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

import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { FieldThresholdType } from 'src/app/core/store/field/field.model';

export class CustomFormValidators {
  static FLOAT_REGEX = /^[+-]?([0-9]*[.])?[0-9]+$/;
  static TIME_REGEX = /^(([01]?\d|2[0-3]):?([0-5]\d|0))|([01]\d|2[0-3])$/;

  public static requiredFloatingNumber(): ValidatorFn {
    return CustomFormValidators.namedPattern(CustomFormValidators.FLOAT_REGEX, 'floatingNumber');
  }

  public static requiredTimeFormat(): ValidatorFn {
    return CustomFormValidators.namedPattern(CustomFormValidators.TIME_REGEX, 'timeFormat');
  }

  public static isTimeStringValid(timeString: string): boolean {
    const regExp = new RegExp(CustomFormValidators.TIME_REGEX);
    return regExp.test(timeString);
  }

  /**
   * The FormControl using this validator is required
   * if the FormControl specified trough otherControlName is not "empty".
   * Hereby, the values null, undefined, the number 0 and the string '' are considered as empty.
   *
   * @param otherControlName: Name of the other control.
   */
   public static requiredIfOtherNotEmpty(otherControlName: string): ValidatorFn {
    return (control: FormControl): { [key: string]: any } => {
      if (control.parent instanceof FormGroup) {
        const otherControl = control.parent.get(otherControlName);
        if ( otherControl != null && otherControl.value &&
           ( control.value === null || control.value === '' )) {
          return {
            required: true
          };
        }
      }

      return null;
    };
  }

  /**
   * The FormControl using this validator is required
   * if any FormControl specified in the Array of otherControlNames is not "empty".
   * Hereby, the values null, undefined, the number 0 and the string '' are considered as empty.
   *
   * @param otherControlNames: Array of names of the other controls.
   */
  public static requiredIfAnyOtherNotEmpty(otherControlNames: string[]): ValidatorFn {
    return (control: FormControl): { [key: string]: any } => {
      for (const otherControlName of otherControlNames) {
        if (control.parent instanceof FormGroup) {
          const otherControl = control.parent.get(otherControlName);
          if ( otherControl != null && otherControl.value &&
            ( control.value === null || control.value === '' )) {
            return {
              required: true
            };
          }
        }
      }

      return null;
    };
  }

  /**
   * The FormControl using this validator is required
   * if the fieldThresholdType is mandatory and the control is not "empty".
   * Hereby, null and '' are considered as empty.
   *
   * @param fieldThresholdType: Specifies if field is mandatory, optional or disabled
   */
  public static requiredIfMandatoryField(fieldThresholdType: FieldThresholdType): ValidatorFn {
    return (control: FormControl) => {
      if (control.parent instanceof FormGroup && (control.value === null || control.value === '' )) {
        if (fieldThresholdType === FieldThresholdType.MANDATORY) {
          return {
            required: true
          };
        }
      }

      return null;
    };
  }

  /**
   * Function to return pattern specific validation errors.
   *  With the pattern names different help texts can be displayed.
   *
   * @pattern: a REGEX to check for
   * @patternName: name of the error that will be generated if validation fails.
   */
  public static namedPattern(pattern: string | RegExp, patternName: string, emptyFails: boolean = false): ValidatorFn {

    if (!patternName) {
      patternName = 'pattern';
    }

    // start copy from Validators.pattern
    if (!pattern) {
      return Validators.nullValidator;
    }
    let regex;
    let regexStr;
    if (typeof pattern === 'string') {
      regexStr = '';
      if (pattern.charAt(0) !== '^') {
        regexStr += '^';
      }
      regexStr += pattern;
      if (pattern.charAt(pattern.length - 1) !== '$') {
        regexStr += '$';
      }
      regex = new RegExp(regexStr);
    }
    else {
      regex = pattern;
    }
    // end copy from Validators.pattern

    return (control: FormControl): { [key: string]: any } => {
      if (!control.value && !emptyFails) {
        return null;
      }

      if (!control.value || !regex.test(control.value)) {
        const error = { };
        error[patternName] = true;
        return error;
      }

      return null;
    };
  }
}
