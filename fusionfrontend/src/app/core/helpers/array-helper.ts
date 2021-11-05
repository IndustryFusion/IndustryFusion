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

export class ArrayHelper {

  public static groupByToMap<T>(array: T[], keyLevel1: string, keyLevel2: string = null): Map<string, T[]> {
    // groups item by key, either on one level ('dashboardLevel') or one 2 levels ('fieldDetails.dashboardLevel')
    const groupArray = array.reduce((groups, item) => {
      if (keyLevel2) {
        groups[item[keyLevel1][keyLevel2]] = groups[item[keyLevel1][keyLevel2]] || [];
        groups[item[keyLevel1][keyLevel2]].push(item);
      } else {
        groups[item[keyLevel1]] = groups[item[keyLevel1]] || [];
        groups[item[keyLevel1]].push(item);
      }
      return groups;
    }, { });

    return this.getMapFromGroupedArray<T>(groupArray);
  }

  private static getMapFromGroupedArray<T>(groupArray): Map<string, T[]> {
    const groupMap = new Map<string, T[]>();
    for (const key in groupArray) {
      if (groupArray.hasOwnProperty(key)) {
        groupMap.set(key === 'null' || key === 'undefined' ? null : key, groupArray[key]);
      }
    }

    return groupMap;
  }

}
