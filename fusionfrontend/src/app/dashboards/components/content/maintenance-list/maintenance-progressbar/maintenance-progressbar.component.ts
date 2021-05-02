import { Component, Input, OnInit } from '@angular/core';
import { AssetDetailsWithFields } from 'src/app/store/asset-details/asset-details.model';

const MAINTENANCE_FIELD_NAME = 'Hours till maintenance';
const MAXIMAL_MAINTENANCE_VALUE = 1500;

@Component({
  selector: 'app-maintenance-progressbar',
  templateUrl: './maintenance-progressbar.component.html',
  styleUrls: ['./maintenance-progressbar.component.scss']
})
export class MaintenanceProgressbarComponent implements OnInit {

  @Input()
  asset: AssetDetailsWithFields;

  maintenanceFieldIndex: number;
  maintenanceDurationHours: number;
  maintenanceDurationDays: number;
  maintenanceDurationWeeks: number;
  maintenanceDurationMonth: number;
  maintenancePercentage: number;
  noMaintenacneValue: boolean;

  constructor() { }

  ngOnInit(): void {
    this.maintenanceFieldIndex = this.asset.fields.findIndex(field => field.name === MAINTENANCE_FIELD_NAME);
    if (this.maintenanceFieldIndex !== -1) {
      this.maintenanceDurationHours = Number(this.asset.fields[this.maintenanceFieldIndex].value);
      this.maintenancePercentage = (this.maintenanceDurationHours / MAXIMAL_MAINTENANCE_VALUE) * 100;
      this.maintenanceDurationDays = Math.round(this.maintenanceDurationHours / 24);
      this.maintenanceDurationWeeks = Math.round(this.maintenanceDurationHours / (24 * 7));
      this.maintenanceDurationMonth = Math.round(this.maintenanceDurationHours / (30.4167 * 24));
      this.noMaintenacneValue = false;
    } else {
      this.noMaintenacneValue = true;
    }
  }

}

