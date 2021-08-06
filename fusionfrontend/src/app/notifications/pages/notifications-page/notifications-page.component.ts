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
import { OispService } from '../../../services/oisp.service';
import { OispNotification } from '../../../services/notification.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss']
})
export class NotificationsPageComponent implements OnInit {

  private readonly FETCHING_PERIOD_MILLISECONDS = 5000; // TODO: extract to environment

  notifications: OispNotification[];

  constructor(private oispService: OispService,
              private activatedRoute: ActivatedRoute) {
    this.periodicallyFetchNotifications();
  }

  ngOnInit(): void {
  }

/*  filterRulesByStatus(rules: Rule[]): Rule[] {
    const archivStatus: RuleStatus[] = [RuleStatus.Archived, RuleStatus.Deleted];
    if (this.isRouteActive('overview')) {
      return rules.filter(rule => !archivStatus.includes(rule.status) );
    } else {
      return rules.filter(rule =>  archivStatus.includes(rule.status) );
    }
  }*/

  isRouteActive(subroute: string): boolean {
    const snapshot = this.activatedRoute.snapshot;
    return snapshot.url.map(segment => segment.path).includes(subroute);
  }

  private periodicallyFetchNotifications() {
    setInterval(() => this.fetchNotifications(this.oispService), this.FETCHING_PERIOD_MILLISECONDS);
  }

  private fetchNotifications(oispService: OispService) {
    oispService.getNotifications().subscribe(
      notifications => this.notifications = notifications
    );
  }
}
