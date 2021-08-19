import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-asset-series-wizard-footer',
  templateUrl: './asset-series-wizard-footer.component.html',
  styleUrls: ['./asset-series-wizard-footer.component.scss']
})
export class AssetSeriesWizardFooterComponent implements OnInit {

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
