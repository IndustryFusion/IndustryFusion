import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AssetDetailsWithFields, AssetModalMode } from '../../../../../store/asset-details/asset-details.model';
import { Asset } from '../../../../../store/asset/asset.model';
import { Room } from '../../../../../store/room/room.model';
import { RoomQuery } from '../../../../../store/room/room.query';
import { Location } from '../../../../../store/location/location.model';
import { AssetDetails, AssetModalType } from 'src/app/store/asset-details/asset-details.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetInstantiationComponent } from '../../asset-instantiation/asset-instantiation.component';
import { MenuItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-assets-list-item',
  templateUrl: './assets-list-item.component.html',
  styleUrls: ['./assets-list-item.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class AssetsListItemComponent implements OnInit, OnChanges {

  @Input()
  assetWithDetailsAndFields: AssetDetailsWithFields;
  @Input()
  rooms: Room[];
  @Input()
  allRoomsOfLocations: Room[];
  @Input()
  room: Room;
  @Input()
  locations: Location[];
  @Input()
  location: Location;
  @Input()
  selected = false;
  @Output()
  assetSelected = new EventEmitter<AssetDetailsWithFields>();
  @Output()
  assetDeselected = new EventEmitter<AssetDetailsWithFields>();
  @Output()
  editAssetEvent = new EventEmitter<AssetDetails>();
  @Output()
  deleteAssetEvent = new EventEmitter<AssetDetailsWithFields>();

  showStatusCircle = false;
  roomsOfLocation: Room[];
  assetDetailsForm: FormGroup;
  ref: DynamicDialogRef;
  menuActions: MenuItem[];


  constructor(
    private roomQuery: RoomQuery,
    private formBuilder: FormBuilder,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService) {
      this.createDetailsAssetForm(this.formBuilder, this.assetWithDetailsAndFields);
      this.menuActions = [
        { label: 'Edit', icon: 'pi pi-fw pi-pencil', command: (_) => { this.showEditDialog(); } },
        { label: 'Assign to room', icon: 'pi pw-fw pi-clone', command: (_) => {
          if (this.location) {
            this.showAssignRoomWithLocationDialog();
          } else {
            this.showAssignRoomDialog();
          }
        } },
        { label: 'Delete', icon: 'pi pw-fw pi-trash', command: (_) => { this.showDeleteDialog(); } },
      ];
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.location && this.location)) {
      this.roomsOfLocation = this.location.rooms;
    }
  }

  showEditDialog() {
    this.createDetailsAssetForm(this.formBuilder, this.assetWithDetailsAndFields);
    const ref = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm: this.assetDetailsForm,
        assetToBeEdited: this.assetWithDetailsAndFields,
        locations: this.locations,
        location: this.location,
        rooms: this.rooms,
        activeModalType: AssetModalType.customizeAsset,
        activeModalMode: AssetModalMode.editAssetMode
      },
      header: 'General Information',
    });

    ref.onClose.subscribe((assetFormValues: AssetDetails) => {
      if (assetFormValues) {
        this.editAssetEvent.emit(assetFormValues);
      }
    });
  }

  showAssignRoomDialog() {
    this.createDetailsAssetForm(this.formBuilder, this.assetWithDetailsAndFields);
    const ref = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm: this.assetDetailsForm,
        assetToBeEdited: this.assetWithDetailsAndFields,
        locations: this.locations,
        location: this.location,
        rooms: this.rooms,
        activeModalType: AssetModalType.locationAssignment,
        activeModalMode: AssetModalMode.editRoomForAssetMode
      },
      header: 'Location Assignment',
    });

    ref.onClose.subscribe((assetFormValues: AssetDetails) => {
      if (assetFormValues) {
        this.editAssetEvent.emit(assetFormValues);
      }
    });
  }

  showAssignRoomWithLocationDialog() {
    this.createDetailsAssetForm(this.formBuilder, this.assetWithDetailsAndFields);
    const ref = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm: this.assetDetailsForm,
        assetToBeEdited: this.assetWithDetailsAndFields,
        locations: this.locations,
        location: this.location,
        rooms: this.rooms,
        activeModalType: AssetModalType.roomAssignment,
        activeModalMode: AssetModalMode.editRoomWithPreselecedLocationMode
      },
      header: 'Room Assignment (' + this.location.name + ')',
    });

    ref.onClose.subscribe((assetFormValues: AssetDetails) => {
      if (assetFormValues) {
        this.editAssetEvent.emit(assetFormValues);
      }
    });
  }

  createDetailsAssetForm(formBuilder: FormBuilder, assetWithDetailsAndFields: AssetDetailsWithFields) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.assetDetailsForm = formBuilder.group({
      id: [null],
      roomId: ['', requiredTextValidator],
      name: ['', requiredTextValidator],
      description: [''],
      imageKey: [''],
      manufacturer: ['', requiredTextValidator],
      assetSeriesName: ['', requiredTextValidator],
      category: ['', requiredTextValidator],
      roomName: ['', requiredTextValidator],
      locationName: ['', requiredTextValidator]
    });
    this.assetDetailsForm.patchValue(assetWithDetailsAndFields);
  }

  select() {
    !this.selected ? this.assetSelected.emit(this.assetWithDetailsAndFields) : this.assetDeselected.emit(this.assetWithDetailsAndFields);
  }

  getAssetLink(asset: Asset) {
    if (!asset) { return; }
    if (this.room) {
      return ['assets', asset.id];
    } else if (!this.location) {
      const room: Room = this.roomQuery.getEntity(asset.roomId);
      if (!room) { return; }
      return ['..', 'locations', room.locationId, 'rooms', asset.roomId, 'assets', asset.id];
    } else {
      return ['rooms', asset.roomId, 'assets', asset.id];
    }
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the asset ' + this.assetWithDetailsAndFields.name + '?',
      header: 'Delete Asset Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.onDeleteClick();
      },
      reject: () => {
      }
    });
  }

  onDeleteClick() {
    this.deleteAssetEvent.emit(this.assetWithDetailsAndFields);
  }
}
