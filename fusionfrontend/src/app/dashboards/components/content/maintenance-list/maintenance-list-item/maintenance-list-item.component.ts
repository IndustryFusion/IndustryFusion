import { Component, Input, OnInit } from '@angular/core';
import { AssetDetailsWithFields } from 'src/app/store/asset-details/asset-details.model';


@Component({
  selector: 'app-maintenance-list-item',
  templateUrl: './maintenance-list-item.component.html',
  styleUrls: ['./maintenance-list-item.component.scss']
})
export class MaintenanceListItemComponent implements OnInit {

  @Input()
  assetsWithDetailsAndFields: AssetDetailsWithFields;

  maintenanceDurationHour: number;
  maintenanceDurationMonth: number;
  maintenancePercentage: number;

  constructor() { }

  ngOnInit(): void {
    console.log("blub", this.assetsWithDetailsAndFields)
    this.maintenanceDurationHour = Math.floor(Math.random() * 1500 + 1);
    console.log(this.maintenanceDurationHour);
    this.maintenanceDurationMonth = this.maintenanceDurationHour/(30.4167*24);
    console.log(this.maintenanceDurationMonth);
    this.maintenancePercentage = (this.maintenanceDurationHour/1500)*100;
    console.log(this.maintenancePercentage)
  }

}
