import { NgModule } from '@angular/core';
import { CreateButtonComponent } from '../components/ui/create-button/create-button.component';
import { ItemOptionsMenuComponent } from '../components/ui/item-options-menu/item-options-menu.component';
import { ClrIconModule } from '@clr/angular';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TrashButtonComponent } from '../components/ui/trash-button/trash-button.component';
import { ConfirmButtonComponent } from '../components/ui/confirm-button/confirm-button.component';
import { EditDetailsButtonComponent } from '../components/ui/edit-details-button/edit-details-button.component';
import { EditButtonComponent } from '../components/ui/edit-button/edit-button.component';
import { LocationsMapComponent } from '../components/content/locations-map/locations-map.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AccuracyFormatPipe } from '../pipes/accuracyformat.pipe';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    CreateButtonComponent,
    ItemOptionsMenuComponent,
    TrashButtonComponent,
    ConfirmButtonComponent,
    EditButtonComponent,
    EditDetailsButtonComponent,
    LocationsMapComponent,
    AccuracyFormatPipe,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    ClrIconModule,
    FontAwesomeModule,
    FormsModule,
    MenuModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapsClientId
    }),
  ],
  exports: [
    CommonModule,
    CreateButtonComponent,
    ItemOptionsMenuComponent,
    TrashButtonComponent,
    ConfirmButtonComponent,
    EditButtonComponent,
    EditDetailsButtonComponent,
    LocationsMapComponent,
    FontAwesomeModule,
    FormsModule,
    MenuModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    AccuracyFormatPipe,
  ]
})
export class IFCommon {
}
