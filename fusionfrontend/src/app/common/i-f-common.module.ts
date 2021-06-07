import { NgModule } from '@angular/core';
import { CreateButtonComponent } from '../components/ui/create-button/create-button.component';
import { ItemOptionsMenuComponent } from '../components/ui/item-options-menu/item-options-menu.component';
import { ClrIconModule } from '@clr/angular';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TrashButtonComponent } from '../components/ui/trash-button/trash-button.component';
import { EditButtonComponent } from '../components/ui/edit-button/edit-button.component';
import { ConfirmButtonComponent } from '../components/ui/confirm-button/confirm-button.component';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';


@NgModule({
  declarations: [
    CreateButtonComponent,
    ItemOptionsMenuComponent,
    TrashButtonComponent,
    EditButtonComponent,
    ConfirmButtonComponent,
  ],
  imports: [
    ClrIconModule,
    MenuModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    ButtonModule,
    MenuModule,
    InputTextModule,
    InputTextareaModule
  ],
  exports: [
    CreateButtonComponent,
    ItemOptionsMenuComponent,
    TrashButtonComponent,
    EditButtonComponent,
    ConfirmButtonComponent,
    DialogModule,
    DropdownModule,
    ButtonModule,
    MenuModule,
    InputTextModule,
    InputTextareaModule,
    RadioButtonModule,
    CheckboxModule
  ]
})
export class IFCommon { }
