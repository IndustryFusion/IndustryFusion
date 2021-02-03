import { Component, Input, OnInit } from '@angular/core';
import { LocationWithAssetCount } from '../../../../../store/location/location.model';

@Component({
  selector: 'app-locations-list-item',
  templateUrl: './locations-list-item.component.html',
  styleUrls: ['./locations-list-item.component.scss']
})
export class LocationsListItemComponent implements OnInit {

  @Input()
  location: LocationWithAssetCount;

  constructor() { }

  ngOnInit(): void {
  }

}
