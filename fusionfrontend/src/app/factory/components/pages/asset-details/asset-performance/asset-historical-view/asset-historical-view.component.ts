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
import { Observable, Subject } from 'rxjs';
import { FieldDetails, FieldType, QuantityDataType } from 'src/app/core/store/field-details/field-details.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetQuery } from 'src/app/core/store/asset/asset.query';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { ID } from '@datorama/akita';
import { FactoryAssetDetailsResolver } from '../../../../../../core/resolvers/factory-asset-details.resolver';
import { FactoryAssetDetailsWithFields } from '../../../../../../core/store/factory-asset-details/factory-asset-details.model';
import { AssetPerformanceViewMode } from '../AssetPerformanceViewMode';
import { RouteHelpers } from '../../../../../../core/helpers/route-helpers';
import { SelectItem } from 'primeng/api';
import { faExclamationCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-asset-historical-view',
  templateUrl: './asset-historical-view.component.html',
  styleUrls: ['./asset-historical-view.component.scss']
})
export class AssetHistoricalViewComponent implements OnInit, OnDestroy {

  @Input()
  viewModeOptions: { name: string; value: string; }[];
  viewMode: AssetPerformanceViewMode;

  asset$: Observable<FactoryAssetDetailsWithFields>;
  assetId: ID;

  timeSlotOptions: { name: string; value: string; }[];
  currentTimeslot = 'current';
  startDate: Date;
  endDate: Date = new Date(Date.now());
  minDate: Date;
  maxDate: Date;

  faExclamationCircle = faExclamationCircle;
  faTimes = faTimes;

  maxItemsOptions: SelectItem[];
  maxPoints: number;

  choiceConfigurationMapping:
    { [k: string]: ChoiceConfiguration } = {
    current: new ChoiceConfiguration(false, false, false, false, false, false, false),
    oneTimeSlot: new ChoiceConfiguration(false, true, false, false, true, false, false),
    customDate: new ChoiceConfiguration(true, false, true, false, true, false, false),
    customDateWithEndDate: new ChoiceConfiguration(true, false, true, true, true, false, false),
    onOkClick: new ChoiceConfiguration(false, false, false, false, false, true, false),
    onOkClickShowWarning: new ChoiceConfiguration(false, false, false, false, false, false, true),
  };
  choiceConfiguration: ChoiceConfiguration = this.choiceConfigurationMapping.current;

  private unSubscribe$ = new Subject<void>();
  private wasScrolled = false;


  constructor(private assetQuery: AssetQuery,
              private factoryResolver: FactoryResolver,
              private factoryAssetDetailsResolver: FactoryAssetDetailsResolver,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.resolve();
    this.initViewMode();
    this.initPointAndTimeSlotOptions();
  }

  onTimeslotChanged(): void {
    const timeslotText = (this.currentTimeslot === 'current' || this.currentTimeslot === 'customDate') ? this.currentTimeslot : 'oneTimeSlot';
    this.setOptions(timeslotText, false);

    if (timeslotText === 'oneTimeSlot') {
      this.onOkClicked();
    }
  }

  onOkClicked(): void {
    const prevConfiguration = this.choiceConfiguration;
    this.setOptions('onOkClick', true);

    if (prevConfiguration !== this.choiceConfigurationMapping.current) {
      this.choiceConfiguration.chooseMaxPointsInline = true;
    }
  }

  resetOptions() {
    if (this.currentTimeslot === 'customDate') {
      this.choiceConfiguration = this.choiceConfigurationMapping.customDate;
    } else {
      this.choiceConfiguration = this.choiceConfigurationMapping.oneTimeSlot;
    }
  }

  setStartDate(startDate: Date) {
    this.startDate = startDate;
    this.minDate = startDate;
    this.maxDate = new Date(Date.now());
    this.choiceConfiguration = this.choiceConfigurationMapping.customDateWithEndDate;
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

  isChartOrTableLoaded(field: FieldDetails) {
    if (!this.wasScrolled && 'metric-' + field.externalName === this.activatedRoute.snapshot.fragment) {
      this.scrollToMetric().subscribe(success => this.wasScrolled = success);
    }
  }

  private resolve() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.factoryAssetDetailsResolver.resolve(this.activatedRoute.snapshot);
    this.assetId = this.assetQuery.getActiveId();
    this.asset$ = this.factoryResolver.assetWithDetailsAndFieldsAndValues$;
  }

  private initViewMode() {
    this.viewMode = AssetPerformanceViewMode.HISTORICAL;
  }

  private initPointAndTimeSlotOptions() {
    this.maxItemsOptions = [
      { label: '50', value: 50 }, { label: '200', value: 200 }, { label: '500', value: 500 }, {
        label: '1000',
        value: 1000
      },
    ];
    this.maxPoints = 50;

    this.timeSlotOptions = [{ name: 'Current', value: 'current' },
      { name: '1h', value: '1hour' },
      { name: '24h', value: '1day' },
      { name: 'Custom Date', value: 'customDate' }
    ];
  }

  private setOptions(key: string,
                     validateOptions: boolean) {
    if (validateOptions) {
      if (!this.maxPoints) {
        this.choiceConfiguration = this.choiceConfigurationMapping.onOkClickShowWarning;
        return;
      } else {
        if (this.currentTimeslot === 'customDate') {
          if (!this.startDate || !this.endDate) {
            this.choiceConfiguration = this.choiceConfigurationMapping.onOkClickShowWarning;
            return;
          }
        }
      }
    }
    this.choiceConfiguration = this.choiceConfigurationMapping[key];
  }

  private scrollToMetric(): Observable<boolean> {
    return this.activatedRoute.fragment.pipe(
      map(fragment => {
        const element = document.querySelector('#' + fragment);
        if (element) {
          element.scrollIntoView();
          return true;
        } else {
          return false;
        }
      })
    );
  }
}

class ChoiceConfiguration {
  chooseMaxPoints = false;
  chooseMaxPointsInline = false;
  chooseStartDate = false;
  chooseEndDate = false;
  chooseButton = false;
  clickedOk = false;
  showWarning = false;

  constructor(chooseMaxPoints: boolean,
              chooseMaxPointsInline: boolean,
              chooseStartDate: boolean,
              chooseEndDate: boolean,
              chooseButton: boolean,
              clickedOk: boolean,
              showWarning: boolean) {
    this.chooseMaxPoints = chooseMaxPoints;
    this.chooseMaxPointsInline = chooseMaxPointsInline;
    this.chooseStartDate = chooseStartDate;
    this.chooseButton = chooseButton;
    this.clickedOk = clickedOk;
    this.chooseEndDate = chooseEndDate;
    this.showWarning = showWarning;
  }
}
