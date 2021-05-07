import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AssetType} from "../../../../store/asset-type/asset-type.model";
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-asset-type-edit',
  templateUrl: './asset-type-edit.component.html',
  styleUrls: ['./asset-type-edit.component.scss']
})
export class AssetTypeEditComponent implements OnInit {

  @Input()
  assetTypeForm: FormGroup;

  @Input()
  modalsActive;

  @Output() dismissModalSignal = new EventEmitter<boolean>();
  @Output() confirmModalSignal = new EventEmitter<AssetType>();

  constructor() { }

  ngOnInit() {
  }

  dismissModal()
  {
    this.modalsActive = false;
    this.dismissModalSignal.emit(true);
  }

  confirmModal() {
    //if (this.assetTypeForm.controls) TODO: Max Character Validation

    const assetType = new AssetType();
    assetType.id = this.assetTypeForm.get("id").value;
    assetType.name = this.assetTypeForm.get("name").value;
    assetType.label = this.assetTypeForm.get("label").value;
    assetType.description = this.assetTypeForm.get("description").value;
    this.confirmModalSignal.emit(assetType);
  }

 /* clickedFinish(event: boolean) {
    if (event) {
      if (this.assetDetailsForm.controls[this.roomControlValidation].valid) {
        this.closedRoomAssignmentModalEvent.emit([event, this.selectedRoom]);
      }
    } else {
      this.closedRoomAssignmentModalEvent.emit([event, null]);
    }
  }

  closeModal(event: boolean) {
    if (event) {
      this.stoppedAssetAssignment.emit(event)
    }
  }*/
}
