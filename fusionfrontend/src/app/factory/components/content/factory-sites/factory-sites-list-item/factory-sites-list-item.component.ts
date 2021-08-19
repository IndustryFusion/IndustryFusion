import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FactorySiteWithAssetCount } from 'src/app/store/factory-site/factory-site.model';
import { FactorySite } from 'src/app/store/factory-site/factory-site.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FactorySiteDialogComponent } from '../../factory-site-dialog/factory-site-dialog.component';
import { DialogType } from '../../../../../common/models/dialog-type.model';
import { WizardHelper } from '../../../../../common/utils/wizard-helper';

@Component({
  selector: 'app-factory-sites-list-item',
  templateUrl: './factory-sites-list-item.component.html',
  styleUrls: ['./factory-sites-list-item.component.scss']
})
export class FactorySitesListItemComponent implements OnInit, OnDestroy {

  @Input()
  factorySite: FactorySiteWithAssetCount;

  @Output()
  updateFactorySiteEvent = new EventEmitter<FactorySite>();

  routerLink: string[];
  factorySiteForm: FormGroup;
  ref: DynamicDialogRef;

  constructor(
    private formBuilder: FormBuilder,
    public dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.routerLink = ['factorysites', `${this.factorySite.id}`];
    this.createFactorySiteForm(this.formBuilder, this.factorySite);
  }

  showEditDialog() {
    const ref = this.dialogService.open(FactorySiteDialogComponent, {
      data: {
        factorySiteForm: this.factorySiteForm,
        type: DialogType.EDIT
      },
      header: `Update Factory Site ${this.factorySiteForm.get('name').value}`,
      width: '70%',
      contentStyle: { 'padding-left': '4%', 'padding-right': '4%' },
    });

    ref.onClose.subscribe((factorySite: FactorySite) => this.onCloseCreateDialog(factorySite));
  }

  createFactorySiteForm(formBuilder: FormBuilder, factorySiteToCreate: FactorySite) {
    this.factorySiteForm = formBuilder.group({
      id: [],
      companyId: [null],
      name: ['', WizardHelper.requiredTextValidator],
      line1: [''],
      line2: [''],
      city: ['', WizardHelper.requiredTextValidator],
      zip: [''],
      countryId: [null, Validators.required],
      latitude: [0],
      longitude: [0],
      type: [null, WizardHelper.requiredTextValidator]
    });
    this.factorySiteForm.patchValue(factorySiteToCreate);
  }

  onCloseCreateDialog(factorySite: FactorySite) {
    if (factorySite) {
      this.factorySiteUpdated(factorySite);
    }
  }

  deleteItem() {
  }

  factorySiteUpdated(factorySite: FactorySite): void {
    this.updateFactorySiteEvent.emit(factorySite);
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
