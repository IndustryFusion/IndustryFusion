import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-asset-series-create-footer',
  templateUrl: './asset-series-create-footer.component.html',
  styleUrls: ['./asset-series-create-footer.component.scss']
})
export class AssetSeriesCreateFooterComponent implements OnInit {

  @Input() step: number;

  @Output() back = new EventEmitter<void>();

  @Input() isReadyForNextStep: boolean;

  @Output() nextStep = new EventEmitter<void>();

  @Input() toalSteps: number;

  constructor() {
  }

  ngOnInit(): void {
  }

}
