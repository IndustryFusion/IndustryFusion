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

import { Component, Input, OnInit } from '@angular/core';
import { Rule, RuleActionType, RuleStatus } from 'src/app/core/store/oisp/oisp-rule/oisp-rule.model';
import { ItemOptionsMenuType } from '../../../shared/components/ui/item-options-menu/item-options-menu.type';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CreateFusionAppletComponent } from '../create-fusion-applet/create-fusion-applet.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RuleStatusUtil } from '../../util/rule-status-util';
import { OispRuleService } from '../../../core/store/oisp/oisp-rule/oisp-rule.service';
import { OispRuleQuery } from '../../../core/store/oisp/oisp-rule/oisp-rule.query';
import { Device } from '../../../core/store/oisp/oisp-device/oisp-device.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-fusion-applets-list',
  templateUrl: './fusion-applets-list.component.html',
  styleUrls: ['./fusion-applets-list.component.scss']
})
export class FusionAppletsListComponent implements OnInit {
  @Input()
  showActive = true;

  @Input()
  showActions = true;

  private filterDevice: Device = null;

  @Input()
  set filterByDevice(device: Device) {
    this.filterDevice = device;
    this.filteredRules = this.filterRulesByDevice(this.filteredRules);
  }

  get filterByDevice(): Device { return this.filterDevice; }

  RuleActionType = RuleActionType;

  filteredRules: Rule[] = [];
  displayedRules: Rule[] = [];
  rulesSearchedByName: Rule[] = [];
  rulesSearchedCondition: Rule[] = [];

  public titleMapping: { [k: string]: string } = {
    '=0': this.translate.instant('APP.FUSION_APPLETS.LIST.NO_APPLET'),
    '=1': '# ' + this.translate.instant('APP.FUSION_APPLETS.LIST.APPLET'),
    other: '# ' + this.translate.instant('APP.FUSION_APPLETS.LIST.APPLETS') };

  constructor(
    private oispRuleQuery: OispRuleQuery,
    private oispRuleService: OispRuleService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public ruleStatusUtil: RuleStatusUtil,
    public translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.oispRuleQuery.selectAll().subscribe(rules => {
      rules = this.oispRuleService.filterRulesByStatus(rules, this.showActive);
      this.filteredRules = this.filterRulesByDevice(rules);
    });
    this.displayedRules = this.rulesSearchedByName = this.rulesSearchedCondition = this.filteredRules;
  }

  private filterRulesByDevice(rules: Rule[]) {
    let result: Rule[] = rules;
    if (this.filterByDevice) {
      const deviceCids = this.filterByDevice.components.map(component => component.cid);
      result = rules.filter(rule => {
        const ruleCids = rule.conditions?.values.map(condition => condition.component.cid);
        return deviceCids.filter(deviceCid => ruleCids?.includes(deviceCid)).length > 0;
      });
    }
    return result;
  }

  searchRulesByName(event?: Rule[]) {
    this.rulesSearchedByName = event;
    this.updateDisplayedRules();
  }

  searchRulesByCondition(event?: Rule[]) {
    this.rulesSearchedCondition = event;
    this.updateDisplayedRules();
  }

  updateDisplayedRules() {
    this.displayedRules = this.rulesSearchedByName.filter(rule => this.rulesSearchedCondition.includes(rule));
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
    this.oispRuleService.setRuleStatus(this.filteredRules[rowIndex].id, status).subscribe(updatedRule => {
      this.filteredRules[rowIndex] = updatedRule;
      this.filteredRules = this.oispRuleService.filterRulesByStatus(this.filteredRules, this.showActive);
      }
    );
  }

  createItem() {
    const dialogConfig: DynamicDialogConfig = {
      header: this.translate.instant('APP.FUSION_APPLETS.LIST.CREATE_DIALOG_HEADER')
    };
    const dynamicDialogRef = this.dialogService.open(CreateFusionAppletComponent, dialogConfig);
    dynamicDialogRef.onClose.subscribe(result => {
      if (result) {
        this.oispRuleService.createRuleDraft(result).subscribe(newRule => {
          this.filteredRules.push(newRule);
          this.filteredRules = this.oispRuleService.filterRulesByStatus(this.filteredRules, this.showActive);
          this.router.navigate(['fusion-applets', 'editor', newRule.id]);
        });
      }
    });
  }

  editItem(rowIndex: number) {
    this.router.navigate(['fusion-applets', 'detail', this.filteredRules[rowIndex].id]);
  }

  deleteItem(rowIndex: number) {
    this.oispRuleService.deleteRule(this.filteredRules[rowIndex].id).subscribe(() => {
      const archivedRule = JSON.parse(JSON.stringify(this.filteredRules[rowIndex]));
      archivedRule.status = RuleStatus.Deleted;
      this.filteredRules[rowIndex] = archivedRule;
      this.filterRulesAndUpdate();
    });
  }

  cloneItem(rowIndex: number) {
    this.oispRuleService.cloneRule(this.filteredRules[rowIndex].id).subscribe(clonedApplet => {
      this.filteredRules.splice(rowIndex + 1, 0, clonedApplet);
      this.filterRulesAndUpdate();
    });
  }

  private filterRulesAndUpdate() {
    this.filteredRules = this.oispRuleService.filterRulesByStatus(this.filteredRules, this.showActive);
    this.displayedRules = this.rulesSearchedByName = this.rulesSearchedCondition = this.filteredRules;
    this.updateDisplayedRules();
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

  onToggleRoute(): Promise<boolean> {
    const newRoute = ['..', this.showActive ? 'active' : 'archiv'];
    return this.router.navigate(newRoute, { relativeTo: this.getActiveRouteLastChild() });
  }

  private getActiveRouteLastChild() {
    let route = this.activatedRoute;
    while (route.firstChild !== null) {
      route = route.firstChild;
    }
    return route;
  }
}
