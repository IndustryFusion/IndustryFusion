import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FusionAppletsComponent } from './components/fusion-applets/fusion-applets.component';
import { FusionAppletsRoutingModule } from './fusion-applets-routing.module';



@NgModule({
  declarations: [
    FusionAppletsComponent,
  ],
  imports: [
    CommonModule,
    FusionAppletsRoutingModule,
  ]
})
export class FusionAppletsModule { }
