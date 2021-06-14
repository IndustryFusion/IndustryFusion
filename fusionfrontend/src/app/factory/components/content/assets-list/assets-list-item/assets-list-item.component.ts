import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AssetDetailsWithFields } from '../../../../../store/asset-details/asset-details.model';
import { Asset } from '../../../../../store/asset/asset.model';
import { Room } from '../../../../../store/room/room.model';
import { RoomQuery } from '../../../../../store/room/room.query';
import { Location } from '../../../../../store/location/location.model';
import { AssetDetails, AssetModalType } from 'src/app/store/asset-details/asset-details.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetInstantiationComponent } from '../../asset-instantiation/asset-instantiation.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-assets-list-item',
  templateUrl: './assets-list-item.component.html',
  styleUrls: ['./assets-list-item.component.scss'],
  providers: [DialogService]
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
  editRoom = new EventEmitter<Room>();
  @Output()
  editAssetEvent = new EventEmitter<AssetDetails>();
  @Output()
  deleteAssetEvent = new EventEmitter<AssetDetailsWithFields>();

  showStatusCircle = false;
  moveAssetModal = false;
  roomsOfLocation: Room[];
  assetDetailsForm: FormGroup;
  ref: DynamicDialogRef;
  menuActions: MenuItem[];


  constructor(
    private roomQuery: RoomQuery,
    private formBuilder: FormBuilder,
    public dialogService: DialogService) {
      this.createDetailsAssetForm(this.formBuilder, this.assetWithDetailsAndFields);
      this.menuActions = [
        { label: 'Edit item', icon: 'pi pi-fw pi-pencil', command: (_) => { this.showEditDialog(); } },
        { label: 'Move item', icon: 'pi pw-fw pi-clone', command: (_) => { this.onChangeRoomClick(); } },
        { label: 'Delete item', icon: 'pi pw-fw pi-trash', command: (_) => { this.onDeleteClick(); } },
      ];
  }

  ngOnInit(): void {
    this.createDetailsAssetForm(this.formBuilder, this.assetWithDetailsAndFields);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.location && this.location)) {
      this.roomsOfLocation = this.location.rooms;
    }
  }

  showEditDialog() {
    const ref = this.dialogService.open(AssetInstantiationComponent, {
      data: {
        assetDetailsForm: this.assetDetailsForm,
        assetToBeEdited: this.assetWithDetailsAndFields,
        locations: this.locations,
        rooms: this.rooms,
        activeModalType: AssetModalType.customizeAsset
      },
      header: 'Assign name and description to asset',
      contentStyle: { 'padding-top': '1.5%' }
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

  emitEditRoomEvent(room: Room) {
    this.editRoom.emit(room);
    this.moveAssetModal = false;
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

  onChangeRoomClick() {
  }

  onDeleteClick() {
    this.deleteAssetEvent.emit(null);
    // this.assetDeleted.emit(this.assetWithDetailsAndFields);
    // this.emitDeletedAsset.emit(this.assetWithDetailsAndFields);
  }
}
