/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Component, OnInit } from '@angular/core';

import { HomeItemClass, LaunchpadItem } from '../../content/launchpad-item/launchpad-item.model';
import { ActivatedRoute } from '@angular/router';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { Role } from 'src/app/core/models/roles.model';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-launchpad-page',
  templateUrl: './launchpad-page.component.html',
  styleUrls: ['./launchpad-page.component.scss']
})
export class LaunchpadPageComponent implements OnInit {
  private companyId: string;
  items: LaunchpadItem[] = [
    {
      name: 'FabManager',
      text: 'Factory Manager',
      itemClass: HomeItemClass.FACTORY,
      roleRequired: Role.FACTORY_MANAGER,
      icon: '',
      route: '/factorymanager/companies/<COMPANY_ID>'
    },
    {
      name: 'FleetManager',
      text: 'Fleet Manager',
      itemClass: HomeItemClass.FLEET,
      roleRequired: Role.FLEET_MANAGER,
      icon: '',
      route: '/fleetmanager/companies/<COMPANY_ID>/assetseries'
    },
    {
      name: 'EcosystemManager',
      text: 'Ecosystem Manager',
      itemClass: HomeItemClass.ECOSYSTEM,
      roleRequired: Role.ECOSYSTEM_MANAGER,
      icon: '',
      route: '/ecosystemmanager'
    },
    {
      name: 'Dashboards',
      text: 'Dashboards',
      itemClass: HomeItemClass.DASHBOARDS,
      icon: 'bar-chart',
      route: '/dashboards/companies/2/maintenance'
    },
    {
      name: 'Fusion Applets',
      text: '',
      itemClass: HomeItemClass.FUSION_APPLETS,
      icon: '',
      route: '/fusion-applets/'
    }
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private factoryResolver: FactoryResolver,
    private keycloakService: KeycloakService) { }

  ngOnInit() {
    this.factoryResolver.resolve(this.activatedRoute);
    this.companyId = (this.keycloakService.getKeycloakInstance().tokenParsed as any).IF_COMPANY;
    this.items.forEach((item) => {
      item.route = item.route.replace('<COMPANY_ID>', this.companyId);
    });
  }

  hasRequiredRole(item: LaunchpadItem) {
    if (!item.roleRequired) {
      return true;
    }
    return this.keycloakService.isUserInRole(String(item.roleRequired), 'fusion-backend');
  }
}
