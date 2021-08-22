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
import { AgmCoreModule } from '@agm/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AccuracyFormatPipe } from '../pipes/accuracyformat.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { FactorySiteMapComponent } from '../components/content/factory-site-map/factory-site-map.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LabelControlDirective } from '../components/ui/label-control/label-control.directive';
import { TooltipComponent } from '../components/ui/tooltip/tooltip.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableSearchbarComponent } from '../components/ui/table-searchbar/table-searchbar.component';

@NgModule({
  declarations: [
    CreateButtonComponent,
    ItemOptionsMenuComponent,
    TrashButtonComponent,
    ConfirmButtonComponent,
    EditButtonComponent,
    EditDetailsButtonComponent,
    FactorySiteMapComponent,
    AccuracyFormatPipe,
    LabelControlDirective,
    TooltipComponent,
    TableSearchbarComponent,
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
    RadioButtonModule,
    DialogModule,
    ToastModule,
    OverlayPanelModule,
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
    FactorySiteMapComponent,
    FontAwesomeModule,
    FormsModule,
    MenuModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    DialogModule,
    RadioButtonModule,
    CheckboxModule,
    ConfirmDialogModule,
    AccuracyFormatPipe,
    RadioButtonModule,
    LabelControlDirective,
    TooltipComponent,
    TableSearchbarComponent,
  ],
  providers: [
    MessageService
  ]
})
export class IFCommon {
}
