import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FactoryAssetDetailsWithFields } from '../../../../../store/factory-asset-details/factory-asset-details.model';
import { FilterOptions } from '../assets-list.component';

@Component({
  selector: 'app-assets-list-header',
  templateUrl: './assets-list-header.component.html',
  styleUrls: ['./assets-list-header.component.scss']
})
export class AssetsListHeaderComponent implements OnInit {

  @Input()
  factoryAssetDetailsWithFields: FactoryAssetDetailsWithFields[];

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
