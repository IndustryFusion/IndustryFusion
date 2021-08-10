import { Component, Input, OnInit } from '@angular/core';
import { Field } from '../../../../../store/field/field.model';
import { FactoryAssetDetailsWithFields } from '../../../../../store/factory-asset-details/factory-asset-details.model';

@Component({
  selector: 'app-maintenance-progressbar',
  templateUrl: './maintenance-progressbar.component.html',
  styleUrls: ['./maintenance-progressbar.component.scss']
})
export class MaintenanceProgressbarComponent implements OnInit {

  @Input()
  asset: FactoryAssetDetailsWithFields;

  @Input()
  assetFields: Field[];

  @Input()
  maintenanceValueKey: string;

  @Input()
  upperThreshold: number;

  @Input()
  lowerThreshold: number;

  maintenanceValue: number;
  maintenancePercentage: number;

  constructor() {
  }

  ngOnInit(): void {
    this.maintenanceValue = +this.assetFields.find(field => field.name === this.maintenanceValueKey)?.value;
    if (this.maintenanceValue) {
      this.maintenancePercentage = (this.maintenanceValue / this.upperThreshold) * 100;
    }
  }

}
