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

import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OispAlertState, OispAlertStore } from './oisp-alert.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OispAlert, OispAlertStatus, OispPriority } from './oisp-alert.model';
import { FactoryAssetDetailsWithFields } from '../factory-asset-details/factory-asset-details.model';

@Injectable({ providedIn: 'root' })
export class OispAlertQuery extends QueryEntity<OispAlertState> {

  constructor(protected store: OispAlertStore) {
    super(store);
  }

  selectOpenAlerts(): Observable<OispAlert[]> {
    return this.selectAll().pipe(
      map((alerts: OispAlert[]) => {
        return alerts.filter(alert => alert.status !== OispAlertStatus.CLOSED);
      })
    );
  }

  getOpenAlerts(): OispAlert[] {
    return this.getAll().filter(alert => alert.status !== OispAlertStatus.CLOSED);
  }

  selectOpenAlertCount(): Observable<number> {
    return this.selectOpenAlerts().pipe(
      map((alerts: OispAlert[]) => alerts.length)
    );
  }

  public getAssetDetailsWithOpenAlertPriorityUsingReplacedExternalId(assetDetails: FactoryAssetDetailsWithFields):
    FactoryAssetDetailsWithFields {
    const openAlerts = this.getOpenAlerts();
    const assetOrDetailsCopy = Object.assign({ }, assetDetails);
    const alertPriorities: OispPriority[] = [];

    alertPriorities.push(this.getMostCriticalPriorityOfExternalId(assetOrDetailsCopy.externalId, openAlerts));
    assetOrDetailsCopy.fields?.forEach(field => {
      alertPriorities.push(this.getMostCriticalPriorityOfExternalId(field.externalId, openAlerts));
    });

    assetOrDetailsCopy.openAlertPriority = this.getMostCriticalPriority(alertPriorities);
    return assetOrDetailsCopy;
  }

  private getMostCriticalPriorityOfExternalId(externalId: string, openAlerts: OispAlert[]): OispPriority {
    let mostCriticalPriority = null;

    if (externalId) {
      const openAlertsOfExternalId = openAlerts.filter(alert => String(alert.deviceUID) === externalId);
      if (openAlertsOfExternalId.length > 0) {
        const sortedAlerts = openAlertsOfExternalId.sort((openAlert1, openAlert2) =>
          OispAlert.getPriorityAsNumber(openAlert1.priority) - OispAlert.getPriorityAsNumber(openAlert2.priority));
        mostCriticalPriority = sortedAlerts[0].priority;
      }
    } else {
      console.warn('[oisp alert query]: ExternalId does not exist');
    }

    return mostCriticalPriority;
  }

  private getMostCriticalPriority(priorities: OispPriority[]): OispPriority {
    let mostCriticalPriority = null;

    priorities = priorities.filter(priority => priority != null);
    if (priorities && priorities.length > 0) {
      const sortedPriorities = priorities.sort((priority1, priority2) =>
        OispAlert.getPriorityAsNumber(priority1) - OispAlert.getPriorityAsNumber(priority2));
      mostCriticalPriority = sortedPriorities[0];
    }

    return mostCriticalPriority;
  }

  resetStore() {
    this.store.reset();
  }

  resetError() {
    this.store.setError(null);
  }

}
