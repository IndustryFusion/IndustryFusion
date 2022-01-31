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

export class EnumHelpers {
  public getIterableArray(enumeration): Array<any> {
    return Object.keys(enumeration)
      .map(key => this.asEnum(enumeration, key))
      .filter(key => typeof key === 'string');
  }

  public getLength(enumeration): number {
    return this.getIterableArray(enumeration).length;
  }

  public asEnum<T>(t, enumVal: T | string): T {
    if (typeof enumVal === 'string') {
      if (enumVal === 'null') {
        return null;
      }
      return t[enumVal];
    } else {
      return enumVal;
    }
  }
}
