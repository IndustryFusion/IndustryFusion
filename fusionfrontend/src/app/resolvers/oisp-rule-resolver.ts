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
import { forkJoin, Observable } from 'rxjs';
import { OispRuleService } from '../store/oisp/oisp-rule/oisp-rule.service';
import { Rule, RuleStatus } from '../store/oisp/oisp-rule/oisp-rule.model';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OispRuleResolver implements Resolve<Rule[]> {
  constructor(private oispRuleService: OispRuleService) { }

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Rule[]> {
    return this.oispRuleService.getAllRules().pipe(
      switchMap(rules => forkJoin(
        this.filterRulesByStatus(rules, activatedRouteSnapshot).map(rule => this.oispRuleService.getRuleDetails(rule.id))
      ))
    );
  }

  private filterRulesByStatus(rules: Rule[], activatedRouteSnapshot: ActivatedRouteSnapshot): Rule[] {
    const archivStatus: RuleStatus[] = [RuleStatus.Archived, RuleStatus.Deleted];
    if (this.isRouteActive('overview', activatedRouteSnapshot)) {
      return rules.filter(rule => !archivStatus.includes(rule.status) );
    } else {
      return rules.filter(rule =>  archivStatus.includes(rule.status) );
    }
  }

  isRouteActive(subroute: string, activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
    return activatedRouteSnapshot.url.map(segment => segment.path).includes(subroute);
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
