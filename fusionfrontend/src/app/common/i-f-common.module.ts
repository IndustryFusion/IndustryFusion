import { NgModule } from '@angular/core';
import { CreateButtonComponent } from '../components/ui/create-button/create-button.component';
import { ItemOptionsMenuComponent } from '../components/ui/item-options-menu/item-options-menu.component';
import { ClrIconModule } from '@clr/angular';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TrashButtonComponent } from '../components/ui/trash-button/trash-button.component';
import { EditButtonComponent } from '../components/ui/edit-button/edit-button.component';
import { ConfirmButtonComponent } from '../components/ui/confirm-button/confirm-button.component';
import { EditDetailsButtonComponent } from '../components/ui/edit-details-button/edit-details-button.component';


@NgModule({
  declarations: [
    CreateButtonComponent,
    ItemOptionsMenuComponent,
    TrashButtonComponent,
    EditButtonComponent,
    ConfirmButtonComponent,
    EditDetailsButtonComponent
  ],
  imports: [
    ClrIconModule,
    MenuModule,
    ButtonModule
  ],
  exports: [
    CreateButtonComponent,
    ItemOptionsMenuComponent,
    TrashButtonComponent,
    EditButtonComponent,
    ConfirmButtonComponent,
    EditDetailsButtonComponent
  ]
})
export class IFCommon { }
