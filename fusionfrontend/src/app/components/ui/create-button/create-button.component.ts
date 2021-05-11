import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-create-button',
  templateUrl: './create-button.component.html',
  styleUrls: ['./create-button.component.scss']
})
export class CreateButtonComponent implements OnInit {

  @Input()
  text: string;

  @Output()
  createItem = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  onClick() {
    this.createItem.emit();
  }
}
