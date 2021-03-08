import { Component, OnInit } from '@angular/core';
import { faSort } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-maintenance-list-header',
  templateUrl: './maintenance-list-header.component.html',
  styleUrls: ['./maintenance-list-header.component.scss']
})
export class MaintenanceListHeaderComponent implements OnInit {

  faSort = faSort;

  constructor() { }

  ngOnInit(): void {
  }

}
