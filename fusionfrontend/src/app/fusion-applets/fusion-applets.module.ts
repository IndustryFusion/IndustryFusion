import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './components/fusion-applets/overview.component';
import { FusionAppletsRoutingModule } from './fusion-applets-routing.module';
import { FusionAppletPageTitleComponent } from './components/fusion-applets-page-title/fusion-applet-page-title.component';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { IFCommon } from '../common/i-f-common.module';



@NgModule({
  declarations: [
    OverviewComponent,
    FusionAppletPageTitleComponent,
  ],
  imports: [
    CommonModule,
    FusionAppletsRoutingModule,
    TableModule,
    InputSwitchModule,
    IFCommon,
  ],
  exports: [
    FusionAppletPageTitleComponent,
  ]
})
export class FusionAppletsModule { }
