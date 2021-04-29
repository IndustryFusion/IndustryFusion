import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LocationWithAssetCount } from 'src/app/store/location/location.model';

@Component({
  selector: 'app-locations-list-item',
  templateUrl: './locations-list-item.component.html',
  styleUrls: ['./locations-list-item.component.scss']
})
export class LocationsListItemComponent implements OnInit {

  @Input()
  location: LocationWithAssetCount;

  modalsActive: boolean = false;
  menuActions: MenuItem[];
  routerLink: string[];

  constructor() {
    this.menuActions = [
      { label: 'Edit', icon: 'pi pi-pencil', command: (_) => { this.openEditModal() } },
      { label: 'Delete', icon: 'pi pi-trash', command: (_) => { } },
    ];
  }

  ngOnInit(): void {
    this.routerLink = ['locations', `${this.location.id}`];
  }

  openEditModal(): void {
    this.modalsActive = true;
  }

  delete(): void {
  }

  locationCreated(): void {
    console.warn("TODO");
  }

  locationUpdated(): void {
    console.warn("TODO");
  }

  closeModal(): void {
    this.modalsActive = false;
  }

}
