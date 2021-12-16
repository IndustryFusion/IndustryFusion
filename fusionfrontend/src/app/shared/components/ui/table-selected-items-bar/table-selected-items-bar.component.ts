import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes, faWrench, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { TableSelectedItemsBarType } from './table-selected-items-bar.type';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-table-selected-items-bar',
  templateUrl: './table-selected-items-bar.component.html',
  styleUrls: ['./table-selected-items-bar.component.scss']
})
export class TableSelectedItemsBarComponent implements OnInit {

  @Input() selectedItems: any[] = [];
  @Input() tableSelectedItemsBarTypes: TableSelectedItemsBarType[];
  @Input() itemTypeSingular: string;
  @Input() itemTypePlural: string;
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

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    this.editBarMapping = {
      '=0': this.translate.instant('APP.SHARED.UI.TABLE_SELECTED_ITEMS_BAR.NO_ITEM_SELECTED', { itemType: this.itemTypePlural}),
      '=1': '# ' + this.translate.instant('APP.SHARED.UI.TABLE_SELECTED_ITEMS_BAR.ITEM_SELECTED', { itemType: this.itemTypeSingular}),
      other: '# ' + this.translate.instant('APP.SHARED.UI.TABLE_SELECTED_ITEMS_BAR.ITEM_SELECTED', { itemType: this.itemTypePlural}),
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
