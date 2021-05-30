import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-modal-save-button',
  templateUrl: './modal-save-button.component.html',
  styleUrls: ['./modal-save-button.component.scss']
})
export class ModalSaveButtonComponent implements OnInit {

  @Input() disabled: boolean;
  @Output() saveItem = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  onClick() {
    this.saveItem.emit();
  }
}
