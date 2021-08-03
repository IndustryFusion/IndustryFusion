import { Component, Input, OnInit } from '@angular/core';
import { Field } from '../../../../../store/field/field.model';

@Component({
  selector: 'app-maintenance-progressbar',
  templateUrl: './maintenance-progressbar.component.html',
  styleUrls: ['./maintenance-progressbar.component.scss']
})
export class MaintenanceProgressbarComponent implements OnInit {

  @Input()
  assetFields: Field[];

  @Input()
  maintenanceValueKey: string;

  @Input()
  maintenanceIntervalKey: string;

  maintenanceValue: number;
  maintenancePercentage: number;
  isMaintenanceInfoAvailable: boolean;

  constructor() {
  }

  ngOnInit(): void {
    this.maintenanceValue = +this.assetFields.find(field => field.name === this.maintenanceValueKey)?.value;
    const maintenanceInterval = +this.assetFields.find(field => field.name === this.maintenanceIntervalKey)?.value;
    this.maintenancePercentage = this.maintenanceValue / maintenanceInterval * (Math.random() * 100);

    if (this.maintenanceValue && this.maintenancePercentage) {
      this.isMaintenanceInfoAvailable = true;
    } else {
      this.isMaintenanceInfoAvailable = false;
    }
  }

}
