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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { OispService } from 'src/app/services/oisp.service';
import { PointWithId } from 'src/app/services/oisp.model';
import { FieldDetails, FieldType, QuantityDataType } from 'src/app/store/field-details/field-details.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { map, switchMap } from 'rxjs/operators';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { ID } from '@datorama/akita';
import { OispDeviceQuery } from '../../../../../../store/oisp/oisp-device/oisp-device.query';
import { FactoryAssetDetailsResolver } from '../../../../../../resolvers/factory-asset-details.resolver';
import { FactoryAssetDetailsWithFields } from '../../../../../../store/factory-asset-details/factory-asset-details.model';
import { AssetPerformanceViewMode } from '../AssetPerformanceViewMode';
import { RouteHelpers } from '../../../../../../common/utils/route-helpers';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-asset-historical-view',
  templateUrl: './asset-historical-view.component.html',
  styleUrls: ['./asset-historical-view.component.scss']
})
export class AssetHistoricalViewComponent implements OnInit, OnDestroy {

  @Input()
  viewModeOptions: { name: string; value: string; }[];
  viewMode: AssetPerformanceViewMode;

  isLoading$: Observable<boolean>;
  asset$: Observable<FactoryAssetDetailsWithFields>;
  assetId: ID;
  latestPoints$: Observable<PointWithId[]>;
  mergedFields$: Observable<FieldDetails[]>;

  timeSlotOptions: { name: string; value: string; }[];
  currentTimeslot = 'current';
  startDate: Date;
  endDate: Date = new Date(Date.now());
  minDate: Date;
  maxDate: Date;

  maxItemsOptions: SelectItem[];
  maxPoints: number;

  choiceConfigurationMapping:
    { [k: string]: ChoiceConfiguration } = {
    current: new ChoiceConfiguration(false, false, false, false, false, false),
    oneTimeSlot: new ChoiceConfiguration(true, false, false, true, false, false),
    customDate: new ChoiceConfiguration(true, true, false, true, false, false),
    customDateWithEndDate: new ChoiceConfiguration(true, true, true, true, false, false),
    onOkClick: new ChoiceConfiguration(false, false, false, false, true, false),
    onOkClickShowWarning: new ChoiceConfiguration(false, false, false, false, false, true),
  };
  currentChoiceConfiguration: ChoiceConfiguration = this.choiceConfigurationMapping.current;

  private unSubscribe$ = new Subject<void>();


  constructor(private assetQuery: AssetQuery,
              private oispService: OispService,
              private oispDeviceQuery: OispDeviceQuery,
              private factoryResolver: FactoryResolver,
              private factoryAssetDetailsResolver: FactoryAssetDetailsResolver,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoading$ = this.assetQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.factoryAssetDetailsResolver.resolve(this.activatedRoute.snapshot);
    this.assetId = this.assetQuery.getActiveId();
    this.asset$ = this.factoryResolver.assetWithDetailsAndFieldsAndValues$;

    this.initLastPoints();
    this.initMergedFields();
    this.initViewMode();
    this.initPointAndTimeSlotOptions();
  }

  private initLastPoints() {
    this.latestPoints$ = this.asset$
      .pipe(
        switchMap(asset => this.oispService.getLastValueOfAllFields(asset, asset.fields, 2))
      );
  }

  private initMergedFields() {
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
        })
      );
  }

  private initViewMode() {
    this.viewMode = AssetPerformanceViewMode.HISTORICAL;
  }

  private initPointAndTimeSlotOptions() {
    this.maxItemsOptions = [
      { label: '50', value: 50 }, { label: '200', value: 200 }, { label: '500', value: 500 }, { label: '1000', value: 1000 },
    ];
    this.maxPoints = 50;

    this.timeSlotOptions = [{ name: 'Current', value: 'current' },
      { name: '1h', value: '1hour' },
      { name: '24h', value: '1day' },
      { name: 'Custom Date', value: 'customDate' }
    ];
  }

  onTimeslotChanged(): void {
    const timeslotText = (this.currentTimeslot === 'current' || this.currentTimeslot === 'customDate') ? this.currentTimeslot : 'oneTimeSlot';
    this.setOptions(timeslotText, false);
  }

  onOkClicked(): void {
    const old = this.currentTimeslot;
    this.currentTimeslot = undefined;
    this.setOptions('onOkClick', true);
    this.currentTimeslot = old;
  }

  private setOptions(key: string,
                     validateOptions: boolean = false) {
    if (validateOptions) {
      if (!this.maxPoints) {
        this.currentChoiceConfiguration = this.choiceConfigurationMapping.onOkClickShowWarning;
        return;
      } else {
        if (this.currentTimeslot === 'customDate') {
          if (!this.startDate || !this.endDate) {
            this.currentChoiceConfiguration = this.choiceConfigurationMapping.onOkClickShowWarning;
            return;
          }
        }
      }
    }
    this.currentChoiceConfiguration = this.choiceConfigurationMapping[key];
  }

  resetOptions() {
    if (this.currentTimeslot === 'customDate') {
      this.currentChoiceConfiguration = this.choiceConfigurationMapping.customDate;
    } else {
      this.currentChoiceConfiguration = this.choiceConfigurationMapping.oneTimeSlot;
    }
  }

  setMinAndMaxDate(startDate: Date) {
    this.startDate = startDate;
    this.minDate = startDate;
    this.maxDate = new Date(Date.now());
    this.currentChoiceConfiguration = this.choiceConfigurationMapping.customDateWithEndDate;
  }

  hasTypeCategorical(field: FieldDetails): boolean {
    return field.quantityDataType === QuantityDataType.CATEGORICAL;
  }

  hasTypeNumeric(field: FieldDetails): boolean {
    return field.quantityDataType === QuantityDataType.NUMERIC;
  }

  isNotAttribute(field: FieldDetails) {
    return (field.fieldType !== FieldType.ATTRIBUTE);
  }

  onChangeRoute(): Promise<boolean> {
    const newRoute = ['..', this.viewMode];
    return this.router.navigate(newRoute, { relativeTo: RouteHelpers.getActiveRouteLastChild(this.activatedRoute) });
  }

  ngOnDestroy() {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
}

class ChoiceConfiguration {
  chooseMaxPoints = false;
  chooseStartDate = false;
  chooseEndDate = false;
  chooseButton = false;
  clickedOk = false;
  showWarning = false;

  constructor(chooseMaxPoints: boolean,
              chooseStartDate: boolean,
              chooseEndDate: boolean,
              chooseButton: boolean,
              clickedOk: boolean,
              showWarning: boolean) {
    this.chooseMaxPoints = chooseMaxPoints;
    this.chooseStartDate = chooseStartDate;
    this.chooseButton = chooseButton;
    this.clickedOk = clickedOk;
    this.chooseEndDate = chooseEndDate;
    this.showWarning = showWarning;
  }
}
