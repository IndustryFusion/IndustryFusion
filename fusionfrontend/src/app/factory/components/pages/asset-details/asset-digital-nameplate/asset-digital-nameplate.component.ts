import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FactoryResolver } from '../../../../services/factory-resolver.service';

@Component({
  selector: 'app-asset-digital-nameplate',
  templateUrl: './asset-digital-nameplate.component.html',
  styleUrls: ['./asset-digital-nameplate.component.scss']
})
export class AssetDigitalNameplateComponent implements OnInit {

  constructor(public activatedRoute: ActivatedRoute,
              private factoryResolver: FactoryResolver) {
  }

  ngOnInit(): void {
    this.factoryResolver.resolve(this.activatedRoute);
  }

}
