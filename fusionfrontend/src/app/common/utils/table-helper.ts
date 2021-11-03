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

import { ActivatedRouteSnapshot, Router } from '@angular/router';

export class TableHelper {

  public static updateRowCountInUrl(rowCount: number, router: Router) {
    router.navigate([], { queryParams: { rows: rowCount } });
  }

  public static getValidRowCountFromUrl(currentRowCount: number,
                                        options: number[],
                                        activatedRouteSnapshot: ActivatedRouteSnapshot): number {
    let rowCount = currentRowCount;
    if (activatedRouteSnapshot?.queryParams.rows) {
      const rowCountFromParams = Number(activatedRouteSnapshot.queryParams.rows);

      if (this.isRowCountValid(rowCountFromParams, options)) {
        rowCount = rowCountFromParams;
      }
    }

    return rowCount;
  }

  private static isRowCountValid(rowCount: number, options: number[], ) {
    return options.includes(rowCount);
  }
}
