import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

export class CustomFormValidators {
  static FLOAT_REGEX = /^[+-]?([0-9]*[.])?[0-9]+$/;

  public static requiredFloatingNumber(): ValidatorFn {
    return CustomFormValidators.namedPattern(CustomFormValidators.FLOAT_REGEX, 'floatingNumber');
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
