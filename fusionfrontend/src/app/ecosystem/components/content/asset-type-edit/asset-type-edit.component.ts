import {Component, OnInit} from '@angular/core';
import {AssetType} from "../../../../store/asset-type/asset-type.model";
import {FormGroup} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-asset-type-edit',
  templateUrl: './asset-type-edit.component.html',
  styleUrls: ['./asset-type-edit.component.scss']
})
export class AssetTypeEditComponent implements OnInit {

  public assetTypeForm: FormGroup;
  public descriptionLength: number = 0;

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) { }

  ngOnInit() {
    this.assetTypeForm = this.config.data.assetTypeForm;
    this.descriptionLength = this.assetTypeForm.value.description.length;
  }

  onCancel() {
    this.ref.close();
  }

  onSave() {
    // TODO: Input validation
    const assetType = new AssetType();
    assetType.id = this.assetTypeForm.get("id")?.value;
    assetType.name = this.assetTypeForm.get("name")?.value;
    assetType.label = this.assetTypeForm.get("label")?.value;
    assetType.description = this.assetTypeForm.get("description")?.value;
    this.ref.close(assetType);
  }

  onChange(value: string) {
    if (value) {
      this.descriptionLength = value.length;
    }
  }
}
