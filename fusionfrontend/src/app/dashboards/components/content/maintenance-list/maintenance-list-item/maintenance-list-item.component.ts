import { Component, Input, OnInit } from '@angular/core';
import { AssetDetailsWithFields } from 'src/app/store/asset-details/asset-details.model';

@Component({
  selector: 'app-maintenance-list-item',
  templateUrl: './maintenance-list-item.component.html',
  styleUrls: ['./maintenance-list-item.component.scss']
})
export class MaintenanceListItemComponent implements OnInit {

  @Input()
  assetWithDetailsAndFields: AssetDetailsWithFields;

  maintenanceDurationHours: number;
  maintenanceDurationDays: number;
  maintenanceDurationWeeks: number;
  maintenanceDurationMonth: number;
  maintenancePercentage: number;

  constructor() { }

  ngOnInit(): void {
    this.maintenanceDurationHours = Number(this.assetWithDetailsAndFields.videoKey);
    this.maintenancePercentage = (this.maintenanceDurationHours / 1500) * 100;
    this.maintenanceDurationDays = Math.round(this.maintenanceDurationHours / 24);
    this.maintenanceDurationWeeks = Math.round(this.maintenanceDurationHours / (24 * 7));
    this.maintenanceDurationMonth = Math.round(this.maintenanceDurationHours / (30.4167 * 24));
  }

}
