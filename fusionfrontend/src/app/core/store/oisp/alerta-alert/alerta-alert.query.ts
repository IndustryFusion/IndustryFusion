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
import { AlertaAlertState, AlertaAlertStore } from './alerta-alert.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertaAlert, AlertSeverity, IFAlertSeverity, IFAlertStatus } from './alerta-alert.model';
import { FactoryAssetDetailsWithFields } from '../../factory-asset-details/factory-asset-details.model';
import { FieldDetails } from '../../field-details/field-details.model';
import { OispDeviceQuery } from '../oisp-device/oisp-device.query';
import { TreeNode } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class AlertaAlertQuery extends QueryEntity<AlertaAlertState> {

  constructor(protected store: AlertaAlertStore,
              protected oispDeviceQuery: OispDeviceQuery) {
    super(store);
  }

  selectOpenAlerts(): Observable<AlertaAlert[]> {
    return this.selectAll().pipe(
      map((alerts: AlertaAlert[]) => {
        return alerts.filter(alert => AlertaAlert.mapStatusToIfAlertStatus(alert.status) === IFAlertStatus.OPEN);
      })
    );
  }

  selectOpenAlertCount(): Observable<number> {
    return this.selectOpenAlerts().pipe(
      map((alerts: AlertaAlert[]) => alerts.length)
    );
  }

  getOpenAlerts(): AlertaAlert[] {
    return this.getAll().filter(alert => AlertaAlert.mapStatusToIfAlertStatus(alert.status) === IFAlertStatus.OPEN);
  }

  joinAssetDetailsWithOpenAlertSeverity(assetDetails: FactoryAssetDetailsWithFields):
    FactoryAssetDetailsWithFields {
    const openAlerts = this.getOpenAlerts();
    const assetDetailsCopy = Object.assign({ }, assetDetails);
    const alertSeverities: AlertSeverity[] = [];

    const externalIdOfAsset = this.oispDeviceQuery.mapExternalNameOfAssetToDeviceUid(assetDetailsCopy.externalName);
    alertSeverities.push(this.findAlertSeverityByExternalId(externalIdOfAsset, openAlerts));

    assetDetailsCopy.fields?.forEach((fieldInstanceDetails: FieldDetails) => {
      const externalIdOFieldInstanceDetails = this.oispDeviceQuery.
        mapExternalNameOFieldInstanceToComponentId(assetDetailsCopy.externalName, fieldInstanceDetails.externalName);
      alertSeverities.push(this.findAlertSeverityByExternalId(externalIdOFieldInstanceDetails, openAlerts));
    });

    assetDetailsCopy.openAlertSeverity = AlertaAlert.mapSeverityToIFAlertSeverity(this.getMostCriticalSeverity(alertSeverities));
    return assetDetailsCopy;
  }

  private findAlertSeverityByExternalId(externalId: string, openAlerts: AlertaAlert[]): AlertSeverity {
    let mostCriticalSeverity = null;

    if (externalId) {
      const openAlertsOfExternalId = openAlerts.filter(alert => String(alert.resource) === externalId);
      if (openAlertsOfExternalId.length > 0) {
        const sortedAlerts = openAlertsOfExternalId.sort((openAlert1, openAlert2) =>
          AlertaAlert.mapSeverityToSecurityCode(openAlert1.severity) - AlertaAlert.mapSeverityToSecurityCode(openAlert2.severity));
        mostCriticalSeverity = sortedAlerts[0].severity;
      }
    } else {
      console.warn('[oisp alert query]: ExternalId does not exist');
    }

    return mostCriticalSeverity;
  }

  private getMostCriticalSeverity(severities: AlertSeverity[]): AlertSeverity {
    let mostCriticalSeverity = null;

    severities = severities.filter(severity => severity != null);
    if (severities && severities.length > 0) {
      const sortedSeverities = severities.sort((severity1, severity2) =>
        AlertaAlert.mapSeverityToSecurityCode(severity1) - AlertaAlert.mapSeverityToSecurityCode(severity2));
      mostCriticalSeverity = sortedSeverities[0];
    }

    return mostCriticalSeverity;
  }

  public getMaxOpenAlertSeverity(node: TreeNode<FactoryAssetDetailsWithFields>): IFAlertSeverity { // TODO
    let openAlertSeverity: IFAlertSeverity = node.data?.openAlertSeverity;
    if (!node.expanded && node.children?.length > 0) {
      for (const child of node.children) {
        const childMaxOpenAlertSeverity: IFAlertSeverity = this.getMaxOpenAlertSeverity(child);
        if (!openAlertSeverity ||
          Number(openAlertSeverity) > Number(childMaxOpenAlertSeverity)) {
          openAlertSeverity = childMaxOpenAlertSeverity;
        }
      }
    }
    return openAlertSeverity;
  }

  resetStore() {
    this.store.reset();
  }

  resetError() {
    this.store.setError(null);
  }

}
