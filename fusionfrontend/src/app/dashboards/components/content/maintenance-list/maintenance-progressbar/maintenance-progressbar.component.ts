import { Component, Input, OnInit } from '@angular/core';
import { FactoryAssetDetailsWithFields } from 'src/app/store/factory-asset-details/factory-asset-details.model';

const MAINTENANCE_FIELD_NAME = 'Hours till maintenance';
const MAXIMAL_MAINTENANCE_VALUE = 1500;
const HOURS_PER_DAY = 24;
const DAY_PER_WEEK = 7;
const DAYS_PER_MONTH = 30.4167;

@Component({
  selector: 'app-maintenance-progressbar',
  templateUrl: './maintenance-progressbar.component.html',
  styleUrls: ['./maintenance-progressbar.component.scss']
})
export class MaintenanceProgressbarComponent implements OnInit {

  @Input()
  asset: FactoryAssetDetailsWithFields;

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
      this.maintenanceDurationDays = Math.round(this.maintenanceDurationHours / HOURS_PER_DAY);
      this.maintenanceDurationWeeks = Math.round(this.maintenanceDurationHours / (HOURS_PER_DAY * DAY_PER_WEEK));
      this.maintenanceDurationMonth = Math.round(this.maintenanceDurationHours / (DAYS_PER_MONTH * HOURS_PER_DAY));
      this.noMaintenacneValue = false;
    } else {
      this.noMaintenacneValue = true;
    }
  }

}
