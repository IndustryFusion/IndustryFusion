import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FactorySiteWithAssetCount } from 'src/app/store/factory-site/factory-site.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FactorySiteDialogComponent } from '../../factory-site-dialog/factory-site-dialog.component';
import { DialogType } from '../../../../../common/models/dialog-type.model';

@Component({
  selector: 'app-factory-sites-list-item',
  templateUrl: './factory-sites-list-item.component.html',
  styleUrls: ['./factory-sites-list-item.component.scss']
})
export class FactorySitesListItemComponent implements OnInit, OnDestroy {

  @Input()
  factorySite: FactorySiteWithAssetCount;

  factorySiteDialogRef: DynamicDialogRef;

  constructor(public dialogService: DialogService) {
  }

  ngOnInit(): void {
  }

  showEditDialog() {
    this.factorySiteDialogRef = this.dialogService.open(FactorySiteDialogComponent, {
      data: {
        factorySite: this.factorySite,
        type: DialogType.EDIT
      },
      header: `Update Factory Site ${this.factorySite.name}`,
      width: '70%',
      contentStyle: { 'padding-left': '4%', 'padding-right': '4%' },
    });
  }

  deleteItem() {
  }

  ngOnDestroy() {
    if (this.factorySiteDialogRef) {
      this.factorySiteDialogRef.close();
    }
  }
}
