/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  AssetModalMode,
  AssetModalType,
  FactoryAssetDetails,
  FactoryAssetDetailsWithFields
} from 'src/app/core/store/factory-asset-details/factory-asset-details.model';
import { ItemOptionsMenuType } from '../../../../../shared/components/ui/item-options-menu/item-options-menu.type';
import { AssetDetailMenuService } from '../../../../../core/services/menu/asset-detail-menu.service';
import { FactoryResolver } from '../../../../services/factory-resolver.service';
import { FactorySite } from '../../../../../core/store/factory-site/factory-site.model';
import { Room } from '../../../../../core/store/room/room.model';
import { AssetService } from '../../../../../core/store/asset/asset.service';
import { RoomService } from '../../../../../core/store/room/room.service';
import { FactorySiteQuery } from '../../../../../core/store/factory-site/factory-site.query';
import { RoomQuery } from '../../../../../core/store/room/room.query';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ConfirmationService } from 'primeng/api';
import { ImageService } from '../../../../../core/services/api/image.service';
import { CompanyQuery } from '../../../../../core/store/company/company.query';
import { ID } from '@datorama/akita';
import { environment } from '../../../../../../environments/environment';
import { UploadDownloadService } from '../../../../../shared/services/upload-download.service';

@Component({
  selector: 'app-asset-details-info',
  templateUrl: './asset-details-info.component.html',
  styleUrls: ['./asset-details-info.component.scss']
})
export class AssetDetailsInfoComponent implements OnInit, OnChanges {

  @Input()
  assetWithFields: FactoryAssetDetailsWithFields;

  factorySite: FactorySite;
  factorySites: FactorySite[];
  rooms: Room[];

  assetIdOfImage: ID;
  assetImage: string;

  dropdownMenuOptions: ItemOptionsMenuType[] = [ItemOptionsMenuType.EDIT,
                                                ItemOptionsMenuType.ASSIGN,
                                                ItemOptionsMenuType.DELETE,
                                                ItemOptionsMenuType.EXPORT_PACKAGE];

  constructor(private assetDetailMenuService: AssetDetailMenuService,
              private factoryResolver: FactoryResolver,
              private assetService: AssetService,
              private roomService: RoomService,
              private factoryQuery: FactorySiteQuery,
              private roomQuery: RoomQuery,
              private router: Router,
              private routingLocation: Location,
              private confirmationService: ConfirmationService,
              private companyQuery: CompanyQuery,
              private imageService: ImageService,
              private uploadDownloadService: UploadDownloadService) {
  }

  ngOnInit() {
    this.factoryResolver.factorySite$.subscribe(site => this.factorySite = site);
    this.factoryQuery.selectAll().subscribe(sites => this.factorySites = sites);
    this.roomQuery.selectAll().subscribe(rooms => this.rooms = rooms);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assetWithFields) {
      this.loadImageForChangedAsset();
    }
  }

  private loadImageForChangedAsset() {
    if (this.assetWithFields && this.assetWithFields.id !== this.assetIdOfImage) {
      this.assetIdOfImage = this.assetWithFields.id;

      const companyId = this.companyQuery.getActiveId();
      this.imageService.getImageAsUriSchemeString(companyId, this.assetWithFields.imageKey).subscribe(imageText => {
        this.assetImage = imageText;
      });
    }
  }

  openEditDialog() {
    this.assetDetailMenuService.showEditDialog(this.assetWithFields, this.factorySite, this.factorySites, this.rooms,
      () => {
      }, (details) => this.assetUpdated(details));
  }

  openDeleteDialog() {
    this.assetDetailMenuService.showDeleteDialog(this.confirmationService, 'asset-delete-dialog-detail',
      this.assetWithFields.name, () => this.deleteAsset());
  }

  openAssignRoomDialog() {
    if (this.factorySite) {
      this.showAssignRoomDialog(AssetModalType.roomAssignment, AssetModalMode.editRoomWithPreselectedFactorySiteMode,
        `Room Assignment (${this.factorySite.name})`);
    } else {
      this.showAssignRoomDialog(AssetModalType.factorySiteAssignment, AssetModalMode.editRoomForAssetMode,
        'Factory Site Assignment');
    }
  }

  updateAssetData(oldRoom, assetDetails) {
    this.assetService.updateCompanyAsset(assetDetails.companyId, assetDetails).subscribe(
      () => {
        if (oldRoom.id !== assetDetails.roomId) {
          this.roomService.updateRoomsAfterEditAsset(oldRoom.id, assetDetails);
        }
      },
      error => console.error(error)
    );
  }

  private showAssignRoomDialog(modalType: AssetModalType, modalMode: AssetModalMode, header: string) {
    this.assetDetailMenuService.showAssignRoomDialog(this.assetWithFields, this.factorySite, this.factorySites,
      this.rooms, modalType, modalMode, header, (details) => this.assetUpdated(details));
  }

  private assetUpdated(newAssetDetails: FactoryAssetDetails): void {
    const oldRoom = this.getOldRoomForAsset();
    this.updateAssetData(oldRoom, newAssetDetails);
  }

  private getOldRoomForAsset() {
    const roomId = this.assetWithFields.roomId;
    return this.rooms.filter(room => room.id === roomId).pop();
  }

  private deleteAsset() {
    this.assetService.removeCompanyAsset(this.assetWithFields.companyId, this.assetWithFields.id).subscribe(() => {
      const currentUrlSeparated = this.routingLocation.path().split('/');
      const newRoutingLocation = currentUrlSeparated.slice(0, currentUrlSeparated.findIndex(elem => elem === 'assets') + 1);
      this.router.navigateByUrl(newRoutingLocation.join('/'));
    });
  }

  exportNgsiLd() {
    const companyId = this.companyQuery.getActiveId();
    this.uploadDownloadService.downloadFile(`${environment.apiUrlPrefix}/fleet/${companyId}/asset/export/${this.assetWithFields.id}`,
      `Asset_${this.assetWithFields.name.replace(/[^a-zA-Z0-9_-]/g, '')}.zip`);
  }
}
