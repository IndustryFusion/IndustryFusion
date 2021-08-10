import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-factory-sites-list-header',
  templateUrl: './factory-sites-list-header.component.html',
  styleUrls: ['./factory-sites-list-header.component.scss']
})
export class FactorySitesListHeaderComponent implements OnInit {

  faSort = faSort;
  faAngleUp = faAngleUp;
  faAngleDown = faAngleDown;
  sortField: string;

  @Output()
  sortEvent = new EventEmitter<[string, string]>();

  constructor() { }

  ngOnInit(): void {
  }

  sortDescending(field: string) {
    this.sortEvent.emit([field, 'descending']);
    this.sortField = field;
  }

  sortAscending(field: string) {
    this.sortEvent.emit([field, 'ascending']);
    this.sortField = field;
  }

}
