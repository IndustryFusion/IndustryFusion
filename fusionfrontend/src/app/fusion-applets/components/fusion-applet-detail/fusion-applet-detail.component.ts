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
import { Rule } from 'src/app/store/oisp/oisp-rule/oisp-rule.model';
import { ActivatedRoute, Router } from '@angular/router';
import { OispRuleQuery } from '../../../store/oisp/oisp-rule/oisp-rule.query';

@Component({
  selector: 'app-fusion-applet-detail',
  templateUrl: './fusion-applet-detail.component.html',
  styleUrls: ['./fusion-applet-detail.component.scss']
})
export class FusionAppletDetailComponent implements OnInit {
  rule: Rule;

  constructor(
    private activatedRoute: ActivatedRoute,
    private oispRuleQuery: OispRuleQuery,
    private router: Router,
  ) {
    const fusionAppletId = this.activatedRoute.snapshot.paramMap.get('fusionAppletId');
    this.oispRuleQuery.selectEntity(fusionAppletId).subscribe(rule => this.rule = rule);
  }

  ngOnInit(): void {
  }

  navigateToEditor() {
    this.router.navigate(['../..', 'editor', this.rule.id], { relativeTo: this.activatedRoute});
  }
}
