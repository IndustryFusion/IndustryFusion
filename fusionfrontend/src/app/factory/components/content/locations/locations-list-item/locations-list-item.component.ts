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
  public locationForm: FormGroup;
  public ref: DynamicDialogRef;

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
        location: this.location
      },
      header: `Create new Location (${this.locationForm.get('name').value}`,
    });

    ref.onClose.subscribe((location: Location) => this.onCloseCreateDialog(location));
  }

  createLocationForm(formBuilder: FormBuilder, locationToCreate: Location) {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];
    this.locationForm = formBuilder.group({
      id: [],
      name: [this.location.name ? this.location.name : '', requiredTextValidator],
      line1: [this.location.line1 ? this.location.line1 : ''],
      line2: [this.location.line2 ? this.location.line2 : ''],
      city: [this.location.city ? this.location.city : ''],
      zip: [this.location.zip ? this.location.zip : ''],
      country: [this.location.country ? this.location.country : ''],
      type: [this.location.type ? this.location.type : null, requiredTextValidator]
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
