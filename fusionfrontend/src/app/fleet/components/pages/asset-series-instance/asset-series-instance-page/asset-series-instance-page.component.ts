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
import { combineLatest, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FactorySite } from '../../../../../store/factory-site/factory-site.model';
import { AssetQuery } from '../../../../../store/asset/asset.query';
import { Asset } from '../../../../../store/asset/asset.model';
import { FactorySiteQuery } from '../../../../../store/factory-site/factory-site.query';
import { Room } from '../../../../../store/room/room.model';
import { RoomQuery } from '../../../../../store/room/room.query';
import { map } from 'rxjs/operators';
import { AssetWizardComponent } from '../../../content/asset-wizard/asset-wizard.component';
import { CompanyQuery } from '../../../../../store/company/company.query';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetSeriesDetails } from '../../../../../store/asset-series-details/asset-series-details.model';
import { AssetSeriesDetailsQuery } from '../../../../../store/asset-series-details/asset-series-details.query';
import { AssetSeriesDetailsService } from '../../../../../store/asset-series-details/asset-series-details.service';

@Component({
  selector: 'app-asset-series-instance-page',
  templateUrl: './asset-series-instance-page.component.html',
  styleUrls: ['./asset-series-instance-page.component.scss']
})
export class AssetSeriesInstancePageComponent implements OnInit, OnDestroy {

  assetSerieId: ID;
  assetSerieDetails$: Observable<AssetSeriesDetails>;

  isLoading$: Observable<boolean>;
  factorySites$: Observable<FactorySite[]>;
  assetsCombined$: Observable<{ id: ID; asset: Asset; factorySite: FactorySite }[]>;

  assetsMapping:
    { [k: string]: string } = { '=0': 'No assets', '=1': '# Asset', other: '# Assets' };

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

      this.assetsCombined$ = combineLatest([assets$, factorySites$, rooms$]).pipe(
        map((value => {
          const assets: Asset[] = value[0];
          const factorySites: FactorySite[] = value[1];
          const rooms: Room[] = value[2];
          const combined: { id: ID, asset: Asset, factorySite: FactorySite}[] = [];
          for (const asset of assets) {
              const factorySite: FactorySite = factorySites.find(
                factorySiteValue => factorySiteValue.id === rooms.find(
                  roomValue => roomValue.id === asset.roomId
                )?.factorySiteId
              );
              combined.push({ id: asset.id, asset, factorySite });
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
