import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-asset-series-create-step-three',
  templateUrl: './asset-series-create-step-three.component.html',
  styleUrls: ['./asset-series-create-step-three.component.scss']
})
export class AssetSeriesCreateStepTreeComponent implements OnInit {

  @Output() stepChange = new EventEmitter<number>();
  @Output() errorSignal = new EventEmitter<string>();
  @Input() assetSeriesGroup: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

}
