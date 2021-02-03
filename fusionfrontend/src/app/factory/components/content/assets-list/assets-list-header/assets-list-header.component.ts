import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AssetDetailsWithFields } from '../../../../../store/asset-details/asset-details.model';
import { FilterOptions } from '../assets-list.component';

@Component({
  selector: 'app-assets-list-header',
  templateUrl: './assets-list-header.component.html',
  styleUrls: ['./assets-list-header.component.scss']
})
export class AssetsListHeaderComponent implements OnInit {

  @Input()
  assets: AssetDetailsWithFields[];

  @Output()
  filterEvent = new EventEmitter<{ [key: string]: string[]; }>();

  filterDict = { };

  constructor() {
  }

  ngOnInit(): void {
  }

  onFilter(filterOptions: FilterOptions) {
    const filterAttribute = filterOptions.filterAttribute;
    this.filterDict[filterAttribute] = filterOptions.filterFields;
    this.filterEvent.emit(this.filterDict);
  }

}
