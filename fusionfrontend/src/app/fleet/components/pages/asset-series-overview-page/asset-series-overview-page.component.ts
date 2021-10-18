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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ID } from '@datorama/akita';
import { combineLatest, Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FactorySite, FactorySiteType } from '../../../../store/factory-site/factory-site.model';
import { AssetQuery } from '../../../../store/asset/asset.query';
import { Asset } from '../../../../store/asset/asset.model';
import { FactorySiteQuery } from '../../../../store/factory-site/factory-site.query';
import { RoomQuery } from '../../../../store/room/room.query';
import { map } from 'rxjs/operators';
import { AssetWizardComponent } from '../../content/asset-wizard/asset-wizard.component';
import { CompanyQuery } from '../../../../store/company/company.query';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetSeriesDetails } from '../../../../store/asset-series-details/asset-series-details.model';
import { AssetSeriesDetailsQuery } from '../../../../store/asset-series-details/asset-series-details.query';
import { AssetSeriesDetailsService } from '../../../../store/asset-series-details/asset-series-details.service';
import { Company } from '../../../../store/company/company.model';

@Component({
  selector: 'app-asset-series-overview-page',
  templateUrl: './asset-series-overview-page.component.html',
  styleUrls: ['./asset-series-overview-page.component.scss']
})
export class AssetSeriesOverviewPageComponent implements OnInit, OnDestroy {

  assetSerieId: ID;
  assetSerieDetails$: Observable<AssetSeriesDetails>;

  isLoading$: Observable<boolean>;
  factorySites$: Observable<FactorySite[]>;
  assetsCombined$: Observable<{ id: ID; asset: Asset; factorySite: FactorySite, company: Company }[]>;

  assetsMapping:
    { [k: string]: string } = { '=0': 'No assets', '=1': '# Asset', other: '# Assets' };
  of = of;
  public factorySiteTypes = FactorySiteType;

  constructor(private assetSeriesDetailsQuery: AssetSeriesDetailsQuery,
              private assetSeriesDetailsService: AssetSeriesDetailsService,
              private assetQuery: AssetQuery,
              private activatedRoute: ActivatedRoute,
              private roomQuery: RoomQuery,
              private companyQuery: CompanyQuery,
              private dialogService: DialogService,
              private factorySiteQuery: FactorySiteQuery,
              private route: ActivatedRoute) {
    this.resolve(this.activatedRoute);
  }

  ngOnInit(): void {
    this.isLoading$ = this.assetSeriesDetailsQuery.selectLoading();
  }

  ngOnDestroy(): void {
    this.assetSeriesDetailsQuery.resetError();
  }

  resolve(activatedRoute: ActivatedRoute): void {
    const assetSeriesId = activatedRoute.snapshot.paramMap.get('assetSeriesId');
    if (assetSeriesId != null) {
      this.assetSerieDetails$ = this.assetSeriesDetailsQuery.selectEntity(assetSeriesId);
      this.assetSerieId = assetSeriesId;
      this.assetSeriesDetailsService.setActive(this.assetSerieId);

      const assets$ = this.assetQuery.selectAssetsOfAssetSerie(assetSeriesId);
      const rooms$ = this.roomQuery.selectAll();
      const factorySites$ = this.factorySiteQuery.selectAll();
      const companies$ = this.companyQuery.selectAll();

      this.assetsCombined$ = combineLatest([assets$, factorySites$, rooms$, companies$]).pipe(
        map((([assets, factorySites, rooms, companies]) => {
            const combined = [];
            for (const asset of assets) {
              const factorySite = factorySites.find(
                factorySiteValue => factorySiteValue.id === rooms.find(
                  roomValue => roomValue.id === asset.roomId
                )?.factorySiteId
              );
              const assetCompany = companies.find(company => company.id === asset.companyId);
              combined.push({ id: asset.id, asset, factorySite, company: assetCompany });
            }
            return combined;
          })
        ));

      this.factorySites$ = this.assetsCombined$.pipe(
        map(assetsCombinedArray => assetsCombinedArray.map(assetsCombined => assetsCombined.factorySite)
          .filter(factorySite => factorySite != null))
      );
    }
  }

  createAssetFromAssetSeries() {
    const assetWizardRef = this.dialogService.open(AssetWizardComponent, {
      data: {
        companyId: this.companyQuery.getActiveId(),
        prefilledAssetSeriesId: this.assetSerieId,
      },
      header: 'Digital Twin Creator for Assets',
      width: '80%'
    });

    assetWizardRef.onClose.subscribe(() => this.resolve(this.route));
  }
}
