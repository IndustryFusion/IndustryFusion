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
import { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AssetSeries } from '../../../../store/asset-series/asset-series.model';
import { AssetSeriesQuery } from '../../../../store/asset-series/asset-series.query';
import { Location } from '../../../../store/location/location.model';
import { AssetQuery } from '../../../../store/asset/asset.query';
import { Asset } from '../../../../store/asset/asset.model';
import { LocationQuery } from '../../../../store/location/location.query';
import { Room } from '../../../../store/room/room.model';
import { RoomQuery } from '../../../../store/room/room.query';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-asset-serie-page',
  templateUrl: './asset-serie-page.component.html',
  styleUrls: ['./asset-serie-page.component.scss']
})
export class AssetSeriePageComponent implements OnInit, OnDestroy {

  assetSerieId: ID;
  assetSerie$: Observable<AssetSeries>;

  isLoading$: Observable<boolean>;
  location: Location;
  locations$: Observable<Location[]>;
  assetsCombined$: Observable<{ id: ID; asset: Asset; location: Location }[]>;

  constructor(private assetSeriesQuery: AssetSeriesQuery,
              private assetQuery: AssetQuery,
              private activatedRoute: ActivatedRoute,
              private roomQuery: RoomQuery,
              private locationQuery: LocationQuery) {
    const loc = new Location();
    loc.latitude = 42;
    loc.longitude = 8;
    this.location = loc;
  }

  ngOnInit(): void {
    this.isLoading$ = this.assetSeriesQuery.selectLoading();
    this.resolve(this.activatedRoute);
  }

  ngOnDestroy(): void {
    this.assetSeriesQuery.resetError();
  }

  resolve(activatedRoute: ActivatedRoute): void {
    const assetSeriesId = activatedRoute.snapshot.paramMap.get('assetSeriesId');
    if (assetSeriesId != null) {
      this.assetSerie$ = this.assetSeriesQuery.selectEntity(assetSeriesId);
      this.assetSerieId = assetSeriesId;

      const assets$ = this.assetQuery.selectAssetsOfAssetSerie(assetSeriesId);
      const rooms$ = this.roomQuery.selectAll();
      const locations$ = this.locationQuery.selectAll();

      this.assetsCombined$ = combineLatest(assets$, locations$, rooms$).pipe(
        map((value => {
          const assets: Asset[] = value[0];
          const locations: Location[] = value[1];
          const rooms: Room[] = value[2];
          const combined: { id: ID, asset: Asset, location: Location}[] = [];
          for (const asset of assets) {
              const location: Location = locations.find(
                locationValue => locationValue.id === rooms.find(
                  roomValue => roomValue.id === asset.roomId
                ).locationId
              );
              combined.push({ id: asset.id, asset, location});
            }
          return combined;
        })
      ));

      this.locations$ = this.assetsCombined$.pipe(
        map(assetsCombinedArray => assetsCombinedArray.map(assetsCombined => assetsCombined.location))
      );
    }
  }
}
