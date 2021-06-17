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
import { ID } from '@datorama/akita';

import { AssetSeriesService } from '../../../../store/asset-series/asset-series.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetSeries } from '../../../../store/asset-series/asset-series.model';
import { Observable } from 'rxjs';
import { AssetSeriesComposedQuery } from '../../../../store/composed/asset-series-composed.query';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FieldSourceResolver } from '../../../../resolvers/field-source.resolver';
import { FieldTargetService } from '../../../../store/field-target/field-target.service';

@Component({
  selector: 'app-asset-type-template-create',
  templateUrl: './asset-series-create.component.html',
  styleUrls: ['./asset-series-create.component.scss']
})
export class AssetSeriesCreateComponent implements OnInit {
  private route: ActivatedRoute;

  constructor(private assetSeriesService: AssetSeriesService,
              private assetSeriesQuery: AssetSeriesComposedQuery,
              private router: Router,
              dialogConfig: DynamicDialogConfig,
              private fieldSourceResolver: FieldSourceResolver,
              private fieldTargetService: FieldTargetService,
  ) {
    this.route = dialogConfig.data.route;

  }

  step = 1;
  assetType: ID;
  companyId: ID;
  error: any;
  toalSteps = 4;
  assetSeries$: Observable<AssetSeries>;
  assetSeries: AssetSeries = new AssetSeries();

  ngOnInit() {
    this.companyId = this.route.parent.snapshot.paramMap.get('companyId');

    this.resolve();

    this.route.queryParamMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
        this.assetSeries$ = this.assetSeriesQuery.selectAssetSeries(paramMap.get('id'));
        this.resolve();
        this.assetSeries$.subscribe(assetSeries => this.assetSeries = assetSeries );
      }
      if (paramMap.has('step')) {
        const paramStep = Number(paramMap.get('step'));
        if (paramStep !== this.step) {
          this.step = paramStep;
          this.onStepChange(this.step);
        }
      }
    });
  }

  onStepChange(step: number) {
    this.error = undefined;
    this.step = step;
    if (this.assetSeries?.id || this.assetSeries?.assetTypeTemplateId) {
      this.onUpdateAssetSeries();
    }
    const queryParams: any = { step: this.step};
    if (this.assetSeries?.id) {
      queryParams.id = this.assetSeries.id;
    }
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { step: this.step, id: this.assetSeries?.id},
        queryParamsHandling: 'merge'
      });
  }

  onUpdateAssetSeries() {
    if (this.assetSeries.id) {
      this.assetSeriesService.editItem(this.assetSeries.id, this.assetSeries)
        .subscribe(newAssetSeries => this.assetSeries = newAssetSeries);
    } else {
      this.assetSeries.companyId = this.companyId;
      this.assetSeriesService.createItem(this.assetSeries.companyId, this.assetSeries.assetTypeTemplateId)
        .subscribe(newAssetSeries => this.assetSeries = newAssetSeries);
    }
  }

  onCloseError() {
    this.error = undefined;
  }

  onError(error: string) {
    this.error = error;
  }

  nextStep() {
    if (this.step === this.toalSteps) {
      this.router.navigate(['../'], { relativeTo: this.route });
    } else {
      this.onStepChange(this.step + 1);
    }
  }

  back() {
    if (this.step === 1) {
      this.router.navigate(['../'], { relativeTo: this.route });
    } else {
      this.onStepChange( this.step - 1);
    }
  }

  readyToTakeNextStep(): boolean {
    let result = true;
    switch (this.step) {
      case 1:
        break;
      case 2:
        result = this.assetSeries?.name !== undefined;
        break;
    }
    return result;
  }

  private resolve() {
    this.fieldSourceResolver.resolve(this.route.snapshot);
    if (this.assetSeries?.assetTypeTemplateId) {
      this.fieldTargetService.getItemsByAssetTypeTemplate(this.assetSeries.assetTypeTemplateId).subscribe();
    }
  }
}
