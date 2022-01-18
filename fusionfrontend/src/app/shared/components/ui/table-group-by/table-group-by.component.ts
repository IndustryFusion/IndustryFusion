import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { StatusWithAssetId } from '../../../../factory/models/status.model';
import { Field, FieldDataType, FieldOption } from '../../../../core/store/field/field.model';
import {
  FactoryAssetDetailsWithFields
} from '../../../../core/store/factory-asset-details/factory-asset-details.model';

@Component({
  selector: 'app-table-group-by',
  templateUrl: './table-group-by.component.html',
  styleUrls: ['./table-group-by.component.scss']
})
export class TableGroupByComponent implements OnInit, OnChanges {

  @Input()
  fields: Field[];
  @Input()
  assetsToBeGrouped: FactoryAssetDetailsWithFields[];
  @Input()
  statusesWithAssetId: StatusWithAssetId[];
  @Input()
  position: [string, string];
  @Output()
  groupedItems = new EventEmitter<any>();

  hasPositionSet = false;


  enumOptions: FieldOption[] = [];
  selectedEnum: FieldOption = null;

  constructor(
  ) {
  }

  ngOnInit(): void {
    this.fields = this.fields.filter(field => field.dataType === FieldDataType.ENUM);
    if (this.position) {
      this.hasPositionSet = true;
      this.changeTheme(this.position[0], this.position[1]);
    }
  }

  ngOnChanges(): void {
    if (this.fields) {
      this.fields = this.fields.filter(field => field.dataType === FieldDataType.ENUM);
      this.fields.forEach(field => console.log(field.id, field.dataType, field.enumOptions));
      this.enumOptions = [];
      this.fields.forEach(field => this.enumOptions.push(new FieldOption(field.id, field.description)));
    }
  }

  enumSelected() {
    this.assetsToBeGrouped.forEach(asset => {
      const fields = asset.fields;
      fields.filter(field => field.id === this.selectedEnum.fieldId).forEach(field => console.log(field, asset));
    });
  }

  private changeTheme(top: string, left: string) {
    document.documentElement.style.setProperty('--top-position', top);
    document.documentElement.style.setProperty('--left-position', left);
  }

  clearSelectedEnum() {
    this.selectedEnum = null;
  }

}
