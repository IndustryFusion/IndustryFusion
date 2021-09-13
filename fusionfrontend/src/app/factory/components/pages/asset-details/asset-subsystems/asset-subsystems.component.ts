import { Component, OnInit } from '@angular/core';
import { FactoryAssetDetailsQuery } from '../../../../../store/factory-asset-details/factory-asset-details.query';
import { combineQueries } from '@datorama/akita';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  FactoryAssetDetailsWithFields
} from '../../../../../store/factory-asset-details/factory-asset-details.model';
import { FactoryComposedQuery } from '../../../../../store/composed/factory-composed.query';
import { ActivatedRoute, Router } from '@angular/router';
import { FactoryAssetDetailsService } from '../../../../../store/factory-asset-details/factory-asset-details.service';
import { OispAlertPriority } from '../../../../../store/oisp/oisp-alert/oisp-alert.model';

@Component({
  selector: 'app-asset-subsystems',
  templateUrl: './asset-subsystems.component.html',
  styleUrls: ['./asset-subsystems.component.scss']
})
export class AssetSubsystemsComponent implements OnInit {
  OispPriority = OispAlertPriority;

  subsystems$: Observable<FactoryAssetDetailsWithFields[]>;
  selected: FactoryAssetDetailsWithFields;

  public titleMapping:
    { [k: string]: string } = { '=0': 'No Subsystem', '=1': '# Subsystem', other: '# Subsystems' };


  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private factoryAssetDetailsService: FactoryAssetDetailsService,
    private factoryAssetDetailsQuery: FactoryAssetDetailsQuery,
    private factoryComposedQuery: FactoryComposedQuery,
  ) { }

  ngOnInit(): void {
    this.subsystems$ = combineQueries([
      this.factoryAssetDetailsQuery.waitForActive(),
      this.factoryComposedQuery.selectAssetsWithFieldInstanceDetails()
    ]).pipe(
      map(([activeAsset, allAssets]) => {
        return allAssets.filter(asset => activeAsset.subsystemIds.includes(asset.id));
      })
    );
  }

  selectSubsystem(asset: any) {
    console.log(asset);
    this.factoryAssetDetailsService.setActive(asset.id);
    this.router.navigate(['../..', asset.id], { relativeTo: this.activatedRoute});
  }
}
