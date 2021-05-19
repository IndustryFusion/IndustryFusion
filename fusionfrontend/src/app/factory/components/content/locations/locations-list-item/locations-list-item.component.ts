import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LocationWithAssetCount } from 'src/app/store/location/location.model';
import { Location } from 'src/app/store/location/location.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LocationDialogComponent } from '../../location-dialog/location-dialog.component';

@Component({
  selector: 'app-locations-list-item',
  templateUrl: './locations-list-item.component.html',
  styleUrls: ['./locations-list-item.component.scss']
})
export class LocationsListItemComponent implements OnInit, OnDestroy {

  @Input()
  location: LocationWithAssetCount;

  @Output()
  updateLocationEvent = new EventEmitter<Location>();

  menuActions: MenuItem[];
  routerLink: string[];
  locationForm: FormGroup;
  ref: DynamicDialogRef;

  constructor(
    private formBuilder: FormBuilder,
    public dialogService: DialogService) {
    this.menuActions = [
      { label: 'Edit', icon: 'pi pi-pencil', command: (_) => { this.showCreateDialog(); } },
      { label: 'Delete', icon: 'pi pi-trash', command: (_) => { } },
    ];
  }

  ngOnInit(): void {
    this.routerLink = ['locations', `${this.location.id}`];
    this.createLocationForm(this.formBuilder, this.location);
  }

  showCreateDialog() {
    const ref = this.dialogService.open(LocationDialogComponent, {
      data: {
        locationForm: this.locationForm,
      },
      header: `Update Location ${this.locationForm.get('name').value}`,
      width: '70%',
      contentStyle: { 'padding-left': '4%', 'padding-right': '4%' },
    });

    ref.onClose.subscribe((location: Location) => this.onCloseCreateDialog(location));
  }

  createLocationForm(formBuilder: FormBuilder, locationToCreate: Location) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.locationForm = formBuilder.group({
      id: [],
      companyId: [null],
      name: ['', requiredTextValidator],
      line1: [''],
      line2: [''],
      city: ['', requiredTextValidator],
      zip: [''],
      country: ['', requiredTextValidator],
      latitude: [0],
      longitude: [0],
      type: [null, requiredTextValidator]
    });
    this.locationForm.patchValue(locationToCreate);
  }

  onCloseCreateDialog(location: Location) {
    if (location) {
      this.locationUpdated(location);
    }
  }

  locationUpdated(location: Location): void {
    this.updateLocationEvent.emit(location);
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
