import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { BaseEntity } from '../../../store/baseentity.model';

@Component({
  selector: 'app-table-searchbar',
  templateUrl: './table-searchbar.component.html',
  styleUrls: ['./table-searchbar.component.scss']
})
export class TableSearchbarComponent implements OnInit {

  @Input() itemsToBeFiltered: any;
  @Output() searchByName = new EventEmitter<any>();

  searchText: string;
  faSearch = faSearch;

  constructor() { }

  ngOnInit(): void {
  }

  filterItems() {
    if (this.searchText) {
      this.searchByName.emit(this.filterItemsBySearchText());
    } else {
      this.searchByName.emit(this.itemsToBeFiltered);
    }
  }

  filterItemsBySearchText<ItemType extends BaseEntity>(): ItemType {
    const filteredItems = this.itemsToBeFiltered
      .filter(item => item.name.toLowerCase().includes(this.searchText.toLowerCase()));
    console.log(filteredItems);
    return filteredItems;
  }

}
