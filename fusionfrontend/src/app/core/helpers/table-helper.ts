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

  public static rowsPerPageOptions: number[] = [5, 10, 50];
  public static defaultRowCount = 10;

  public static updateRowCountInUrl(rowCount: number, router: Router) {
    router.navigate([], { queryParams: { rows: rowCount } });
  }

  public static getValidRowCountFromUrl(currentRowCount: number,
                                        activatedRouteSnapshot: ActivatedRouteSnapshot,
                                        router: Router,
                                        rowsPerPageOptions?: number[]): number {
    if (!rowsPerPageOptions) {
      rowsPerPageOptions = this.rowsPerPageOptions;
    }

    let rowCount = currentRowCount;
    if (activatedRouteSnapshot?.queryParams.rows) {
      const rowCountFromParams = Number(activatedRouteSnapshot.queryParams.rows);

      if (this.isRowCountValid(rowCountFromParams, rowsPerPageOptions)) {
        rowCount = rowCountFromParams;
      } else {
        this.removeRowCountFromUrl(router);
      }
    }

    return rowCount;
  }

  private static removeRowCountFromUrl(router: Router) {
    router.navigate([], { queryParams: { } });
  }

  private static isRowCountValid(rowCount: number, rowsPerPageOptions: number[], ) {
    return rowsPerPageOptions.includes(rowCount);
  }
}
