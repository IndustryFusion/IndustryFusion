import { Component, Input, OnInit } from '@angular/core';
import { FactoryAssetDetailsWithFields } from '../../../../../store/factory-asset-details/factory-asset-details.model';
import { MaintenanceState } from '../maintenance-list.component';

@Component({
  selector: 'app-maintenance-progressbar',
  templateUrl: './maintenance-progressbar.component.html',
  styleUrls: ['./maintenance-progressbar.component.scss']
})
export class MaintenanceProgressbarComponent implements OnInit {

  @Input()
  asset: FactoryAssetDetailsWithFields;

  @Input()
  maintenanceValue: number;

  @Input()
  maintenancePercentage: number;

  @Input()
  state: MaintenanceState;

  maintenanceState = MaintenanceState;

  constructor() {
  }

  ngOnInit(): void {
  }

}
