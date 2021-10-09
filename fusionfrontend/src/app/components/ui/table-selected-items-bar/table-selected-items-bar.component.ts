import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes, faWrench, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { TableSelectedItemsBarType } from './table-selected-items-bar.type';

@Component({
  selector: 'app-table-selected-items-bar',
  templateUrl: './table-selected-items-bar.component.html',
  styleUrls: ['./table-selected-items-bar.component.scss']
})
export class TableSelectedItemsBarComponent implements OnInit {

  @Input() selectedItems: any[] = [];
  @Input() tableSelectedItemsBarTypes: TableSelectedItemsBarType[];
  @Input() itemName: string;
  @Output() deselectAllItems = new EventEmitter<void>();
  @Output() showAssetCards = new EventEmitter<void>();
  @Output() closeNotification = new EventEmitter<void>();
  @Output() editItem = new EventEmitter<void>();
  @Output() deleteItem = new EventEmitter<void>();

  editBarMapping: { [k: string]: string };

  faCheckCircle = faCheckCircle;
  faThLarge = faThLarge;
  faWrench = faWrench;
  faTrashAlt = faTrashAlt;
  faTimes = faTimes;

  TableSelectedItemsBarType = TableSelectedItemsBarType;

  constructor() { }

  ngOnInit(): void {
    this.editBarMapping = {
      '=0': 'No ' + this.itemName + 's selected',
      '=1': '# ' + this.itemName + ' selected',
      other: '# ' + this.itemName + 's selected'
    };
  }

  onCardsViewClick() {
    this.showAssetCards.emit();
  }

  onDeselectClick() {
    this.deselectAllItems.emit();
  }

  onEditClick() {
    this.editItem.emit();
  }

  onDeleteClick() {
    this.deleteItem.emit();
  }

  onCloseNotification() {
    this.closeNotification.emit();
  }
}
