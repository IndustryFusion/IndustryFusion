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
import {
  FactoryAssetDetailsWithFields
} from '../../../../../core/store/factory-asset-details/factory-asset-details.model';
import { FactoryResolver } from '../../../../services/factory-resolver.service';
import { FactoryAssetDetailsQuery } from '../../../../../core/store/factory-asset-details/factory-asset-details.query';
import { faLayerGroup, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import { FactoryAssetDetailsResolver } from '../../../../../core/resolvers/factory-asset-details.resolver';
import { FieldDataType } from '../../../../../core/store/field/field.model';
import { MediaObjectType } from '../../../../../core/models/media-object.model';
import { ManualService } from '../../../../../core/services/api/storage/manual.service';
import { VideoService } from '../../../../../core/services/api/storage/video.service';
import { CompanyQuery } from '../../../../../core/store/company/company.query';
import { MediaObjectService } from '../../../../../core/services/api/storage/media-object.service';


@Component({
  selector: 'app-asset-digital-nameplate',
  templateUrl: './asset-digital-nameplate.component.html',
  styleUrls: ['./asset-digital-nameplate.component.scss']
})

export class AssetDigitalNameplateComponent implements OnInit {

  assetId: ID;
  asset$: Observable<FactoryAssetDetailsWithFields>;

  latestPoints$: Observable<PointWithId[]>;
  mergedFields$: Observable<FieldDetails[]>;
  status$: Observable<Status>;

  manualIcon = faLayerGroup;
  videoIcon = faPlayCircle;
  fieldDataTypes = FieldDataType;
  MediaObjectType = MediaObjectType;

  private static openExternalUrl(url: string): void {
    window.open(url, '_blank');
  }

  constructor(
    private oispService: OispService,
    private oispDeviceQuery: OispDeviceQuery,
    private companyQuery: CompanyQuery,
    private statusService: StatusService,
    private manualService: ManualService,
    private videoService: VideoService,
    private factoryResolver: FactoryResolver,
    private activatedRoute: ActivatedRoute,
    private factoryAssetDetailsResolver: FactoryAssetDetailsResolver,
    private factoryAssetQuery: FactoryAssetDetailsQuery) {
  }

  ngOnInit() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.factoryAssetDetailsResolver.resolve(this.activatedRoute.snapshot);
    this.assetId = this.factoryAssetQuery.getActiveId();
    this.asset$ = this.factoryResolver.assetWithDetailsAndFields$;

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

  openExternalUrlOrDownload(url: string, type: MediaObjectType) {
    const isUploadedObject = type === MediaObjectType.VIDEOS ?
      VideoService.isVideoUploaded(url) : ManualService.isManualUploaded(url);

    if (isUploadedObject) {
      this.downloadFile(url, type);
    } else {
      AssetDigitalNameplateComponent.openExternalUrl(url);
    }
  }

  private downloadFile(mediaObjectKey: string, type: MediaObjectType): void {
    const companyId = this.companyQuery.getActiveId();
    switch (type) {
      case MediaObjectType.MANUALS:
        this.manualService.getManual(companyId, mediaObjectKey).subscribe(manualObject => {
          MediaObjectService.downloadMediaObject(manualObject);
        });
        break;

      case MediaObjectType.VIDEOS:
        this.videoService.getVideo(companyId, mediaObjectKey).subscribe(videoObject => {
          MediaObjectService.downloadMediaObject(videoObject);
        });
        break;

      default:
        throw new Error('[asset]: Media object type not supported');
    }
  }

  getAttributes(fields: FieldDetails[]): FieldDetails[] {
    return fields?.filter(field => field.fieldType === FieldType.ATTRIBUTE);
  }
}
