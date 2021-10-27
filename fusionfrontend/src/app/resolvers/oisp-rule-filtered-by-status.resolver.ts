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

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { OispRuleService } from '../store/oisp/oisp-rule/oisp-rule.service';
import { Rule } from '../store/oisp/oisp-rule/oisp-rule.model';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OispRuleFilteredByStatusResolver implements Resolve<Rule[]> {
  private activatedRouteSnapshot: ActivatedRouteSnapshot;

  constructor(private oispRuleService: OispRuleService) { }

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Rule[]> {
    this.activatedRouteSnapshot = activatedRouteSnapshot;
    return this.addActionsToFilteredRules(this.oispRuleService.getAllRules());
  }

  private addActionsToFilteredRules(rules$: Observable<Rule[]>): Observable<Rule[]>  {
    return rules$.pipe(
      switchMap(rules => forkJoin(
        this.filterRulesByStatus(rules)
          .map(filteredRule => this.getRuleDetailsWithActions(filteredRule))
      ))
    );
  }

  private filterRulesByStatus(rules: Rule[]): Rule[] {
    const showActive = this.isRouteActive('overview')
      || this.isRouteActive('active');
    return this.oispRuleService.filterRulesByStatus(rules, showActive);
  }

  private getRuleDetailsWithActions(filteredRule: Rule): Observable<Rule> {
    if (!filteredRule.actions) {
      return this.oispRuleService.getRuleDetails(filteredRule.id);
    } else {
      return of(filteredRule);
    }
  }

  private isRouteActive(subroute: string): boolean {
    return this.activatedRouteSnapshot.url.map(segment => segment.path).includes(subroute);
  }
}

@Injectable({ providedIn: 'root' })
export class OispSingleRuleResolver implements Resolve<Rule> {
  constructor(private oispRuleService: OispRuleService) { }

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Rule> {
    const fusionAppletId = activatedRouteSnapshot.paramMap.get('fusionAppletId');
    this.oispRuleService.setActive(fusionAppletId);
    return this.oispRuleService.getRuleDetails(fusionAppletId);
  }
}
