import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AssetDetailsWithFields } from '../../../../../store/asset-details/asset-details.model';
import { Asset } from '../../../../../store/asset/asset.model';
import { Room } from '../../../../../store/room/room.model';
import { RoomQuery } from '../../../../../store/room/room.query';
import { Location } from '../../../../../store/location/location.model';
import { AssetDetails, AssetModalType } from 'src/app/store/asset-details/asset-details.model';


@Component({
  selector: 'app-assets-list-item',
  templateUrl: './assets-list-item.component.html',
  styleUrls: ['./assets-list-item.component.scss']
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
  assetDetailsEdited = new EventEmitter<AssetDetails>();
  @Output()
  assetDeleted = new EventEmitter<AssetDetailsWithFields>();

  showStatusCircle = false;
  moveAssetModal = false;
  roomsOfLocation: Room[];
  modalsActive = false;
  assetModalTypes = AssetModalType;
  modalTypeActive: AssetModalType;


  constructor(
    private roomQuery: RoomQuery,
    ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.location && this.location)) {
      this.roomsOfLocation = this.location.rooms;
    }
  }

  select() {
    !this.selected ? this.assetSelected.emit(this.assetWithDetailsAndFields) : this.assetDeselected.emit(this.assetWithDetailsAndFields);
  }

  openAssignmentModal() {
    this.moveAssetModal = true;
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

  forwardAssetDetails(event: AssetDetails) {
    this.assetDetailsEdited.emit(event);
  }

  assetEditingStopped(event: boolean) {
    this.modalsActive = event;
  }

  deleteAsset() {
    this.assetDeleted.emit(this.assetWithDetailsAndFields);
  }
}
