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
import { Rule, RuleStatus } from '../../../services/oisp.model';
import { ItemOptionsMenuType } from '../../../components/ui/item-options-menu/item-options-menu.type';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  ItemOptionsMenuType = ItemOptionsMenuType;

  rules: Rule[];

  constructor(private oispService: OispService) { }

  ngOnInit(): void {
    this.oispService.getAllRules().subscribe(rules => this.rules = rules);
  }

  isActive(status: string): boolean {
    return status === RuleStatus.Active;
  }

  isDraft(status: string) {
    return status === RuleStatus.Draft;
  }

  changeStatus(rowIndex: number, isActive: any) {
    let status: RuleStatus;
    if (isActive) {
      status = RuleStatus.Active;
    } else {
      status = RuleStatus.OnHold;
    }
    this.oispService.setRuleStatus(this.rules[rowIndex].id, status).subscribe( updatedRule => {
      this.rules[rowIndex] = updatedRule;
      }
    );
  }

  createItem() {

  }

  editItem() {

  }

  showDeleteItem() {

  }
}
