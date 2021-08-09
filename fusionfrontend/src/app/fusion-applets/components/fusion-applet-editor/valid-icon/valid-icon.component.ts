import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-valid-icon',
  templateUrl: './valid-icon.component.html',
  styleUrls: ['./valid-icon.component.scss']
})
export class ValidIconComponent implements OnInit {
  @Input()
  isValid: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
