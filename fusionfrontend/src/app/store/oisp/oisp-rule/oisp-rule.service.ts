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
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { OispRuleStore } from './oisp-rule.store';
import { Observable } from 'rxjs';
import { ConditionType, Rule, RuleAction, RuleStatus } from './oisp-rule.model';
import { environment } from '../../../../environments/environment';
import { KeycloakService } from 'keycloak-angular';
import { ID } from '@datorama/akita';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OispRuleService {

  constructor(private oispRuleStore: OispRuleStore,
              private keycloakService: KeycloakService,
              private http: HttpClient) { }
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    params: new HttpParams()
  };

  getAllRules(): Observable<Rule[]> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules`;
    return this.http.get<Rule[]>(url, this.httpOptions).pipe(
      tap((rules: Rule[]) => this.oispRuleStore.upsertMany(rules))
    );
  }

  getRule(ruleId: string): Observable<Rule> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules/${ruleId}`;
    return this.http.get<Rule>(url, this.httpOptions).pipe(
      tap((rule: Rule) => this.oispRuleStore.upsert(rule.id, rule))
    );
  }

  cloneRule(ruleId: string): Observable<Rule> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules/clone/${ruleId}`;
    return this.http.post<Rule>(url, null, this.httpOptions).pipe(
      tap((rule: Rule) => this.oispRuleStore.upsert(rule.id, rule))
    );
  }

  createRuleDraft(ruleDraft: Rule): Observable<Rule> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules/draft`;
    return this.http.put<Rule>(url, ruleDraft, this.httpOptions).pipe(
      tap((rule: Rule) => this.oispRuleStore.upsert(rule.id, rule))
    );
  }

  updateRule(ruleId: string, rule: Rule): Observable<Rule> {
    rule = JSON.parse(JSON.stringify(rule));
    this.prepareRuleForSending(rule);

    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules/${ruleId}`;
    return this.http.put<Rule>(url, rule, this.httpOptions).pipe(
      tap((updatedRule: Rule) => this.oispRuleStore.upsert(updatedRule.id, updatedRule))
    );
  }

  private prepareRuleForSending(rule: Rule) {
    if (!rule.description) {
      delete rule[`description`];
    }
    if (rule.status === RuleStatus.Draft) {
      rule.status = RuleStatus.OnHold;
    }
    rule.conditions.values.map(conditionValue => {
      delete conditionValue[`conditionSequence`];
      if (conditionValue.type !== ConditionType.statistics) {
        delete conditionValue[`baselineCalculationLevel`];
        delete conditionValue[`baselineSecondsBack`];
        delete conditionValue[`baselineMinimalInstances`];
      }
      if (conditionValue.type !== ConditionType.time) {
        delete conditionValue[`timeLimit`];
      }
    });

    rule.actions = rule.actions.map<RuleAction>((ruleAction: RuleAction) => {
      if (typeof ruleAction.target === 'string') {
        ruleAction.target = [ruleAction.target];
      }
      return ruleAction;
    });

    delete rule[`id`];
    delete rule[`domainId`];
    delete rule[`owner`];
    delete rule[`naturalLanguage`];
    delete rule[`creationDate`];
    delete rule[`lastUpdateDate`];
  }

  setRuleStatus(ruleId: string, status: RuleStatus.OnHold | RuleStatus.Active | RuleStatus.Archived): Observable<Rule> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules/${ruleId}/status`;
    const body = { status };
    return this.http.put<Rule>(url, body, this.httpOptions).pipe(
      tap((updatedRule: Rule) => this.oispRuleStore.upsert(updatedRule.id, updatedRule))
    );
  }

  deleteRule(ruleId: string): Observable<any> {
    const url = `${environment.oispApiUrlPrefix}/accounts/${this.getOispAccountId()}/rules/delete_rule_with_alerts/${ruleId}`;
    return this.http.delete(url, this.httpOptions).pipe(
      tap((deletedRule: Rule) => this.oispRuleStore.remove(deletedRule.id))
    );
  }

  private getOispAccountId(): string {
    const token = (this.keycloakService.getKeycloakInstance().tokenParsed as any);
    let oispAccountId = '';

    if (token.accounts && token.accounts.length > 0) {
      oispAccountId = token.accounts[0].id;
    } else {
      console.warn('cannot retrieve OISP accountId, subsequent calls to OISP will hence most likely fail!');
    }

    return oispAccountId;
  }

  setActive(id: ID) {
    this.oispRuleStore.setActive(id);
  }
}
