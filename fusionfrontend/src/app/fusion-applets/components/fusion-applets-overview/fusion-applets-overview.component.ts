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
import { Rule, RuleActionType, RuleStatus } from '../../../services/oisp.model';
import { ItemOptionsMenuType } from '../../../components/ui/item-options-menu/item-options-menu.type';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CreateFusionAppletComponent } from '../create-fusion-applet/create-fusion-applet.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RuleStatusUtil } from '../../util/rule-status-util';

@Component({
  selector: 'app-fusion-applets-overview',
  templateUrl: './fusion-applets-overview.component.html',
  styleUrls: ['./fusion-applets-overview.component.scss']
})
export class FusionAppletsOverviewComponent implements OnInit {
  RuleActionType = RuleActionType;

  rules: Rule[];

  public titleMapping:
    { [k: string]: string } = { '=0': 'No Applet', '=1': '# Applet', other: '# Applets' };

  constructor(
    private oispService: OispService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public ruleStatusUtil: RuleStatusUtil
  ) { }

  ngOnInit(): void {
    this.oispService.getAllRules().subscribe(rules => {
      this.rules = this.filterRulesByStatus(rules);
      this.getRuleDetails();
    });
  }

  filterRulesByStatus(rules: Rule[]): Rule[] {
    const archivStatus: RuleStatus[] = [RuleStatus.Archived, RuleStatus.Deleted];
    if (this.isRouteActive('overview')) {
      return rules.filter(rule => !archivStatus.includes(rule.status) );
    } else {
      return rules.filter(rule =>  archivStatus.includes(rule.status) );
    }
  }

  isRouteActive(subroute: string): boolean {
    const snapshot = this.activatedRoute.snapshot;
    return snapshot.url.map(sement => sement.path).includes(subroute);
  }

  isActive(status: string): boolean {
    return status === RuleStatus.Active;
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
      this.rules = this.filterRulesByStatus(this.rules);
      }
    );
  }

  createItem() {
    const dialogConfig: DynamicDialogConfig = {
      header: 'Create Applet'
    };
    const dynamicDialogRef = this.dialogService.open(CreateFusionAppletComponent, dialogConfig);
    dynamicDialogRef.onClose.subscribe(result => {
      if (result) {
        this.oispService.createRuleDraft(result).subscribe(newRule => {
          this.rules.push(newRule);
          this.rules = this.filterRulesByStatus(this.rules);
          this.router.navigate(['fusion-applets', newRule.id]);
        });
      }
    });
  }

  editItem(rowIndex: number) {
    this.router.navigate(['fusion-applets', this.rules[rowIndex].id]);
  }

  deleteItem(rowIndex: number) {
    this.oispService.deleteRule(this.rules[rowIndex].id).subscribe(() => {
      this.rules[rowIndex].status = RuleStatus.Deleted;
      this.rules = this.filterRulesByStatus(this.rules);
    });
  }

  cloneItem(rowIndex: number) {
    this.oispService.cloneRule(this.rules[rowIndex].id).subscribe(clone => {
      this.rules.splice(rowIndex + 1, 0, clone);
      this.rules = this.filterRulesByStatus(this.rules);
    });
  }

  getMenuOptionsByStatus(status: RuleStatus): ItemOptionsMenuType[] {
    let result: ItemOptionsMenuType[];
    switch (status) {
      case RuleStatus.Active:
      case RuleStatus.OnHold:
        result = [ItemOptionsMenuType.EDIT, ItemOptionsMenuType.RENAME, ItemOptionsMenuType.CLONE, ItemOptionsMenuType.DELETE];
        break;
      case RuleStatus.Archived:
      case RuleStatus.Deleted:
        result = [ItemOptionsMenuType.CLONE];
        break;
      case RuleStatus.Draft:
        result = [ItemOptionsMenuType.EDIT, ItemOptionsMenuType.RENAME, ItemOptionsMenuType.DELETE];
        break;
    }

    return result;
  }

  hasActionType(rule: Rule, type: RuleActionType): boolean {
    return rule.actions?.map(action => action.type).includes(type);
  }

  private getRuleDetails() {
    for (let i = 0; i < this.rules.length; i++) {
      this.oispService.getRule(this.rules[i].id).subscribe(rule => this.rules[i] = rule);
    }
  }
}