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
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AssetWithFields } from '../../store/asset/asset.model';
import { FieldSourceQuery } from '../../store/field-source/field-source.query';
import { FieldSourceResolver } from '../../resolvers/field-source.resolver';
import { map } from 'rxjs/operators';
import { FieldType } from '../../store/field-details/field-details.model';
import { AssetSeriesQuery } from '../../store/asset-series/asset-series.query';
import { ConnectivityTypeQuery } from '../../store/connectivity-type/connectivity-type.query';

@Injectable({
  providedIn: 'root'
})
export class AssetOnboardingService {
  constructor(private readonly assetSeriesQuery: AssetSeriesQuery,
              private readonly fieldSourceResolver: FieldSourceResolver,
              private readonly fieldSourceQuery: FieldSourceQuery,
              private readonly connectivityTypeQuery: ConnectivityTypeQuery) {
  }

  private getDataServiceType(asset: AssetWithFields): DataServiceType {
    let dataServiceType = DataServiceType.PULL;

    const assetSeries = this.assetSeriesQuery.getEntity(asset.assetSeriesId);
    if (assetSeries) {
      const connectivityTypes = this.connectivityTypeQuery.getAll();

      const connectivityType = connectivityTypes.find(type => type.id === assetSeries.connectivitySettings.connectivityTypeId);
      const connectivityProtocol = connectivityType.availableProtocols
        .find(protocol => protocol.id === assetSeries.connectivitySettings.connectivityProtocolId);

      if (connectivityProtocol?.name === 'MQTT') {
        dataServiceType = DataServiceType.PUSH;
      }
    }

    return dataServiceType;
  }

  public createYamlFile(assetWithFields: AssetWithFields, activatedRoute: ActivatedRoute): Observable<any> {
    return this.fieldSourceResolver.resolve(activatedRoute.snapshot).pipe(map(() => {

      let yamlContent = `# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

fusiondataservice:
  name: ${assetWithFields.name}
  connectionString: ${assetWithFields.connectionString}
  downstreamServiceBaseUrl: http://localhost:8085/
  dataServiceType: ${this.getDataServiceType(assetWithFields)}
  autorun: true
  jobSpecs:
    betriebsdaten:
      period: 2000
      fields:`;

      const metrics = assetWithFields?.fields.filter(field => field.fieldType === FieldType.METRIC);
      metrics.forEach(field => {
          const fieldSource = this.fieldSourceQuery.getEntity(field.fieldSourceId);
          yamlContent += `
        - source: "${fieldSource?.register}"
          target: ${field.fieldLabel}`;
        });

      return yamlContent;
    }));
  }
}

enum DataServiceType {
  PULL = 'PULL',
  PUSH = 'PUSH'
}
