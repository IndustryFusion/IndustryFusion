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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Status } from 'src/app/factory/models/status.model';
import { PointWithId } from 'src/app/core/services/api/oisp.model';
import { OispService } from 'src/app/core/services/api/oisp.service';
import { StatusService } from 'src/app/core/services/logic/status.service';
import { FieldDetails, FieldType } from 'src/app/core/store/field-details/field-details.model';
import { OispDeviceQuery } from '../../../../../core/store/oisp/oisp-device/oisp-device.query';
import { ID } from '@datorama/akita';
import { FactoryAssetDetailsWithFields } from '../../../../../core/store/factory-asset-details/factory-asset-details.model';
import { FactoryAssetDetailsQuery } from '../../../../../core/store/factory-asset-details/factory-asset-details.query';
import { environment } from 'src/environments/environment';
import { FactoryResolver } from '../../../../../factory/services/factory-resolver.service';
import { FactoryAssetDetailsResolver } from '../../../../../core/resolvers/factory-asset-details.resolver';
import { FactorySite, FactorySiteType } from '../../../../../core/store/factory-site/factory-site.model';
import { Company } from '../../../../../core/store/company/company.model';
import { CompanyQuery } from '../../../../../core/store/company/company.query';
import { FactorySiteQuery } from '../../../../../core/store/factory-site/factory-site.query';
import { RouteHelpers } from '../../../../../core/helpers/route-helpers';
import { AssetSeriesDetailsService } from '../../../../../core/store/asset-series-details/asset-series-details.service';
import { FactoryComposedQuery } from '../../../../../core/store/composed/factory-composed.query';
import { AssetOnboardingService } from '../../../../../core/services/logic/asset-onboarding.service';
import { AssetService } from '../../../../../core/store/asset/asset.service';
import { IfApiService } from '../../../../../core/services/api/if-api.service';


@Component({
  selector: 'app-asset-series-asset-digital-nameplate',
  templateUrl: './asset-series-asset-digital-nameplate.component.html',
  styleUrls: ['./asset-series-asset-digital-nameplate.component.scss']
})
export class AssetSeriesAssetDigitalNameplateComponent implements OnInit {

  assetId: ID;
  asset$: Observable<FactoryAssetDetailsWithFields>;

  latestPoints$: Observable<PointWithId[]>;
  mergedFields$: Observable<FieldDetails[]>;
  status$: Observable<Status>;

  factorySite$: Observable<FactorySite>;
  company$: Observable<Company>;

  private companyId: ID;
  private assetSeriesId: ID;

  factorySiteTypes = FactorySiteType;

  constructor(
    private oispService: OispService,
    private oispDeviceQuery: OispDeviceQuery,
    private statusService: StatusService,
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute,
    private factoryAssetQuery: FactoryAssetDetailsQuery,
    private factoryAssetDetailsResolver: FactoryAssetDetailsResolver,
    private companyQuery: CompanyQuery,
    private factorySiteQuery: FactorySiteQuery,
    private assetSeriesDetailsService: AssetSeriesDetailsService,
    private factoryComposedQuery: FactoryComposedQuery,
    private assetOnboardingService: AssetOnboardingService,
    public assetService: AssetService,
    private ifApiService: IfApiService
  ) {
  }

  /*private static downloadFile(fileContent: string, fileName: string) {
    const blob = new Blob([fileContent], { type: 'text/yaml' });

    if (window.navigator.msSaveOrOpenBlob) {
      // modern way
      window.navigator.msSaveBlob(blob, fileName);
    } else {
      // workaround
      const anchor = window.document.createElement('a');
      anchor.href = window.URL.createObjectURL(blob);
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(anchor.href);
    }
  }*/

  ngOnInit() {
    this.resolve();

    this.factorySite$ = combineLatest([this.asset$, this.factoryResolver.rooms$]).pipe(
      switchMap(([asset, rooms]) => {
        const assetRoom = rooms.find((room) => room.id === asset.roomId);
        return this.factorySiteQuery.selectAll().pipe(
          map(sites => sites.find(site => site.id === assetRoom.factorySiteId))
        );
      })
    );

    this.company$ = this.factorySite$.pipe(switchMap(site => this.companyQuery.selectEntity(site?.companyId)));
    this.company$.subscribe(company => this.companyId = company.id);

    // TODO: refactor using status.service.getStatusByAssetWithFields
    this.latestPoints$ = combineLatest([this.asset$, timer(0, environment.dataUpdateIntervalMs)]).pipe(
      switchMap(([asset, _]) => {
        return this.oispService.getLastValueOfAllFields(asset, asset?.fields, 5);
      })
    );

    this.mergedFields$ = combineLatest([this.asset$, this.latestPoints$])
      .pipe(
        map(([asset, latestPoints]) => {
          return asset.fields.map(field => {
            const fieldCopy = Object.assign({ }, field);
            const point = latestPoints.find(latestPoint => latestPoint.id ===
              this.oispDeviceQuery.mapExternalNameOFieldInstanceToComponentId(asset.externalName, field.externalName));

            if (point) {
              fieldCopy.value = point.value;
            }
            return fieldCopy;
          });
        }));


    this.status$ = this.mergedFields$.pipe(
      map(fields => this.statusService.determineStatus(fields))
    );
  }

  private resolve() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.factoryAssetDetailsResolver.resolve(this.activatedRoute.snapshot);
    this.assetId = this.factoryAssetQuery.getActiveId();
    this.asset$ = this.factoryResolver.assetWithDetailsAndFields$;
    this.asset$.subscribe(asset => this.assetSeriesId = asset.assetSeriesId);

    const assetSeriesId = RouteHelpers.findParamInFullActivatedRoute(this.activatedRoute.snapshot, 'assetSeriesId');
    if (assetSeriesId != null) {
      this.assetSeriesDetailsService.setActive(assetSeriesId);
    }
  }

  getAttributes(fields: FieldDetails[]): FieldDetails[] {
    return fields?.filter(field => field.fieldType === FieldType.ATTRIBUTE);
  }

  generateAssetOnboardingFile() {
    this.asset$.subscribe(asset => {
        this.factoryComposedQuery.joinAssetAndFieldInstanceDetails(asset).subscribe(assetWithField =>
          this.assetOnboardingService.createYamlFile(assetWithField, this.activatedRoute)
            .subscribe(fileContent => this.ifApiService.exportOnboardingPackage(this.companyId, this.assetId,
              this.assetSeriesId, fileContent)));
      }
    );


  }

 /* generateAssetOnboardingFile() {
    this.asset$.subscribe(asset => {
        this.factoryComposedQuery.joinAssetAndFieldInstanceDetails(asset).subscribe(assetWithField =>
          this.assetOnboardingService.createYamlFile(assetWithField, this.activatedRoute)
            .subscribe(fileContent => );
      }
    );
  }*/
}
