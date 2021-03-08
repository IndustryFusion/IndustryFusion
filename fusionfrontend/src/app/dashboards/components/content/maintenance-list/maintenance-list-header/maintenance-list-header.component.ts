import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { AssetDetailsWithFields } from 'src/app/store/asset-details/asset-details.model';


@Component({
  selector: 'app-maintenance-list-header',
  templateUrl: './maintenance-list-header.component.html',
  styleUrls: ['./maintenance-list-header.component.scss']
})
export class MaintenanceListHeaderComponent implements OnInit {

  @Input()
  assetsWithDetailsAndFields: AssetDetailsWithFields[];

  @Output()
  assetSearched = new EventEmitter<AssetDetailsWithFields[]>();

  faSearch = faSearch;
  openSearchBar: boolean = false;
  searchText: string;
  displayedAssets: AssetDetailsWithFields[];

  constructor() { }

  ngOnInit(): void {
  }

  openSearchDialog(){
    if(this.openSearchBar)
      this.openSearchBar = false;
    else
      this.openSearchBar = true
  }

  searchAssets(){
    this.displayedAssets = [];
    this.assetsWithDetailsAndFields.forEach(asset =>
      {
        if(asset.name.toLowerCase().includes(this.searchText.toLowerCase()))
          this.displayedAssets.push(asset)
      });
      this.assetSearched.emit(this.displayedAssets);
      this.openSearchBar = false;
  }

}
