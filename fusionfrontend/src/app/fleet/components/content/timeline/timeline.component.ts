import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  steps: number[];

  @Input()
  totalSteps: number;

  @Input()
  currentStep: number;

  constructor() { }

  ngOnInit(): void {
    this.steps = [];
    for (let i = 0; i < this.totalSteps - 1; i++) {
      this.steps[i] = i + 2;
    }
  }

}
