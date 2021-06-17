import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-asset-series-create-connectivity-settings',
  templateUrl: './asset-series-create-connectivity-settings.component.html',
  styleUrls: ['./asset-series-create-connectivity-settings.component.scss']
})
export class AssetSeriesCreateConnectivitySettingsComponent implements OnInit {

  @Output() stepChange = new EventEmitter<number>();
  @Output() errorSignal = new EventEmitter<string>();
  @Input() assetSeriesGroup: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

}
