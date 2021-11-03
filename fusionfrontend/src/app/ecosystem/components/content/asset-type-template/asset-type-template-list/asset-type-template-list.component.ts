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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AssetTypeTemplateQuery } from '../../../../../store/asset-type-template/asset-type-template.query';
import { AssetTypeTemplateService } from '../../../../../store/asset-type-template/asset-type-template.service';
import { AssetTypeTemplate, PublicationState } from '../../../../../store/asset-type-template/asset-type-template.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';
import { AssetTypeTemplateWizardMainComponent } from '../asset-type-template-wizard/asset-type-template-wizard-main/asset-type-template-wizard-main.component';
import { ID } from '@datorama/akita';
import { DialogType } from '../../../../../common/models/dialog-type.model';
import { AssetTypeTemplateDialogUpdateComponent } from '../asset-type-template-dialog/asset-type-template-update-dialog/asset-type-template-dialog-update.component';
import { ItemOptionsMenuType } from '../../../../../components/ui/item-options-menu/item-options-menu.type';
import { ConfirmationService } from 'primeng/api';
import { FilterOption, FilterType } from '../../../../../components/ui/table-filter/filter-options';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TableHelper } from '../../../../../common/utils/table-helper';

@Component({
  selector: 'app-asset-type-template-list',
  templateUrl: './asset-type-template-list.component.html',
  styleUrls: ['./asset-type-template-list.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class AssetTypeTemplateListComponent implements OnInit, OnDestroy {

  @Input() assetTypeTemplates$: Observable<AssetTypeTemplate[]>;
  @Input() parentAssetTypeId: ID | null;

  public titleMapping:
    { [k: string]: string } = { '=0': 'No Asset type templates', '=1': '# Asset type template', other: '# Asset type templates' };

  public createWizardRef: DynamicDialogRef;
  public assetTypeTemplateForm: FormGroup;

  assetTypeTemplates: AssetTypeTemplate[];
  displayedAssetTypeTemplates: AssetTypeTemplate[];
  filteredAssetTypeTemplates: AssetTypeTemplate[];
  searchedAssetTypeTemplates: AssetTypeTemplate[];

  activeListItem: AssetTypeTemplate;

  public menuType: ItemOptionsMenuType[];
  public rowsPerPageOptions: number[] = [5, 10, 50];
  public rowCount = 10;

  private updateWizardRef: DynamicDialogRef;
  private warningDialogRef: DynamicDialogRef;

  tableFilters: FilterOption[] = [
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Version', attributeToBeFiltered: 'publishedVersion' },
    { filterType: FilterType.DATEFILTER, columnName: 'Publish date', attributeToBeFiltered: 'publishedDate' },
    { filterType: FilterType.DROPDOWNFILTER, columnName: 'Status', attributeToBeFiltered: 'publicationState' }];

  constructor(
    private assetTypeTemplateQuery: AssetTypeTemplateQuery,
    private assetTypeTemplateService: AssetTypeTemplateService,
    private dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService) {
     }

  ngOnInit() {
    this.menuType = [ItemOptionsMenuType.DELETE];
    if (this.assetTypeTemplates$ == null) {
      this.assetTypeTemplates$ = this.assetTypeTemplateQuery.selectAll();
    }
    this.assetTypeTemplates$.subscribe(assetTypeTemplates => {
      this.displayedAssetTypeTemplates = this.filteredAssetTypeTemplates = this.searchedAssetTypeTemplates =
        this.assetTypeTemplates = assetTypeTemplates;
    });

    this.rowCount = TableHelper.getValidRowCountFromUrl(this.rowCount, this.rowsPerPageOptions, this.activatedRoute.snapshot);
    this.updateRowCountInUrl(this.rowCount);
  }

  setActiveRow(assetTypeTemplate?: AssetTypeTemplate): void {
    if (assetTypeTemplate) {
      this.activeListItem = assetTypeTemplate;
      this.menuType = assetTypeTemplate.publicationState === PublicationState.PUBLISHED ?
        [ItemOptionsMenuType.DELETE] : [ItemOptionsMenuType.UPDATE, ItemOptionsMenuType.DELETE];
    }
  }

  searchAssetTypeTemplates(event: AssetTypeTemplate[]): void {
    this.searchedAssetTypeTemplates = event;
    this.updateAssetTypeTemplates();
  }

  filterAssetTypeTemplates(event: AssetTypeTemplate[]) {
    this.filteredAssetTypeTemplates = event;
    this.updateAssetTypeTemplates();
  }

  private updateAssetTypeTemplates(): void {
    this.displayedAssetTypeTemplates = this.assetTypeTemplates;
    if (this.searchedAssetTypeTemplates) {
      this.displayedAssetTypeTemplates = this.filteredAssetTypeTemplates.filter(assetType =>
        this.searchedAssetTypeTemplates.includes(assetType));
    }
  }

  onCreate() {
    this.createWizardRef = this.dialogService.open(AssetTypeTemplateWizardMainComponent, {
      data: {
        type: DialogType.CREATE,
        preselectedAssetTypeId: this.parentAssetTypeId
      },
      header: `Asset Type Template Editor`,
      width: '90%'
    });
  }

  ngOnDestroy() {
    if (this.createWizardRef) {
      this.createWizardRef.close();
    }
    this.assetTypeTemplateQuery.resetError();
  }

  onUpdate() {
    this.warningDialogRef = this.dialogService.open(AssetTypeTemplateDialogUpdateComponent, { width: '60%' } );
    this.warningDialogRef.onClose.subscribe((callUpdateWizard: boolean) => {
      if (callUpdateWizard) {
        this.showUpdateWizard();
      }
    });
  }

  private showUpdateWizard() {
    this.updateWizardRef = this.dialogService.open(AssetTypeTemplateWizardMainComponent,
      {
        data: { assetTypeTemplate: this.activeListItem, type: DialogType.EDIT },
        header: 'Asset Type Template Editor',
        width: '70%',
      }
    );
    this.updateWizardRef.onClose.subscribe((assetTypeTemplateForm: FormGroup) =>
      this.onCloseUpdateWizard(assetTypeTemplateForm));
  }

  private onCloseUpdateWizard(assetTypeTemplateForm: FormGroup) {
    if (assetTypeTemplateForm && assetTypeTemplateForm.get('wasPublished')?.value) {
      this.activeListItem.publicationState = assetTypeTemplateForm.get('publicationState')?.value;
      this.activeListItem.publishedDate = assetTypeTemplateForm.get('publishedDate')?.value;
      this.activeListItem.publishedVersion = assetTypeTemplateForm.get('publishedVersion')?.value;
      this.menuType = [ItemOptionsMenuType.DELETE];
      this.assetTypeTemplateService.editItem(this.activeListItem.id, this.activeListItem).subscribe();
    }
  }

  showDeleteDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the Asset Type Template ' + this.activeListItem.name + '?',
      header: 'Delete Asset Type Template Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteAssetTypeTemplate();
      },
      reject: () => {
      }
    });
  }

  deleteAssetTypeTemplate() {
  }

  updateRowCountInUrl(rowCount: number) {
    TableHelper.updateRowCountInUrl(rowCount, this.router);
  }
}
