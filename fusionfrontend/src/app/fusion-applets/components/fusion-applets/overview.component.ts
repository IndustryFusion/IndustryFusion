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
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CreateFusionAppletComponent } from '../create-fusion-applet/create-fusion-applet.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  ItemOptionsMenuType = ItemOptionsMenuType;

  rules: Rule[];

  public titleMapping:
    { [k: string]: string } = { '=0': 'No Applet', '=1': '# Applet', other: '# Applets' };

  constructor(
    private oispService: OispService,
    private dialogService: DialogService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.oispService.getAllRules().subscribe(rules => this.rules = rules);
  }

  isActive(status: string): boolean {
    return status === RuleStatus.Active;
  }

  canActivated(status: RuleStatus) {
    const canActivatedStatus = [RuleStatus.Active, RuleStatus.Archived, RuleStatus.OnHold];
    return canActivatedStatus.includes(status);
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
    const dialogConfig: DynamicDialogConfig = {
      header: 'Create Applet'
    };
    const dynamicDialogRef = this.dialogService.open(CreateFusionAppletComponent, dialogConfig);
    dynamicDialogRef.onClose.subscribe(result => {
      if (result) {
        this.oispService.createRuleDraft(result).subscribe(newRule => this.rules.push(newRule));
      }
    });
  }

  editItem(rowIndex: number) {
    this.router.navigate(['fusion-applets', this.rules[rowIndex].id]);
  }

  deleteItem(rowIndex: number) {
    this.oispService.deleteRule(this.rules[rowIndex].id).subscribe(() => {
      this.rules[rowIndex].status = RuleStatus.Deleted;
      this.rules = this.rules.slice();
    });
  }

  cloneItem(rowIndex: number) {
    this.oispService.cloneRule(this.rules[rowIndex].id).subscribe(clone => {
      this.rules.splice(rowIndex + 1, 0, clone);
    });
  }

  getMenuOptionsByStatus(status: RuleStatus): ItemOptionsMenuType[] {
    let result: ItemOptionsMenuType[];
    switch (status) {
      case RuleStatus.Active:
      case RuleStatus.Archived:
      case RuleStatus.OnHold:
        result = [ItemOptionsMenuType.EDIT, ItemOptionsMenuType.RENAME, ItemOptionsMenuType.CLONE, ItemOptionsMenuType.DELETE];
        break;
      case RuleStatus.Deleted:
        result = [ItemOptionsMenuType.CLONE];
        break;
      case RuleStatus.Draft:
        result = [ItemOptionsMenuType.EDIT, ItemOptionsMenuType.RENAME, ItemOptionsMenuType.DELETE];
        break;
    }

    return result;
  }
}
