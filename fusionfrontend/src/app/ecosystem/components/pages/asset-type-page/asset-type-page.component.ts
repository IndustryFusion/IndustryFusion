import {Component, OnDestroy, OnInit} from '@angular/core';
import {AssetType} from "../../../../store/asset-type/asset-type.model";
import {Observable} from "rxjs";
import {ID} from "@datorama/akita";
import {AssetTypeQuery} from "../../../../store/asset-type/asset-type.query";
import {ActivatedRoute} from "@angular/router";
import {AssetTypeTemplate} from "../../../../store/asset-type-template/asset-type-template.model";
import {AssetTypesComposedQuery} from "../../../../store/composed/asset-types-composed.query";

@Component({
  selector: 'app-asset-type-details-page',
  templateUrl: './asset-type-page.component.html',
  styleUrls: ['./asset-type-page.component.scss']
})
export class AssetTypePageComponent implements OnInit, OnDestroy {

  assetTypeId: ID;
  assetType$: Observable<AssetType>;
  assetTypeTemplates$: Observable<AssetTypeTemplate[]>;

  isLoading$: Observable<boolean>;

  constructor(private assetTypeQuery: AssetTypeQuery,
              private activatedRoute: ActivatedRoute,
              private assetTypesComposedQuery: AssetTypesComposedQuery) {  }

  ngOnInit(): void {
    this.isLoading$ = this.assetTypeQuery.selectLoading();
    this.resolve(this.activatedRoute);
    this.assetTypeTemplates$ = this.assetTypesComposedQuery.selectTemplatesOfAssetType(this.assetTypeId);
  }

  ngOnDestroy(): void {
    this.assetTypeQuery.resetError();
  }

  // TODO: make resolver with setActive (not existing?!?)  or  using something like factory resolver?
  resolve(activatedRoute: ActivatedRoute): void {
    const assetTypeId = activatedRoute.snapshot.paramMap.get('assettypeId');
    console.log("assetTypeId", assetTypeId);
    if (assetTypeId != null) {
      this.assetType$ = this.assetTypeQuery.selectAssetType(assetTypeId);
      //this.assetType$.subscribe(assetType => this.assetType = assetType);
      this.assetTypeId = assetTypeId;
      //console.log("assetType", this.assetType);
    }
  }
}
