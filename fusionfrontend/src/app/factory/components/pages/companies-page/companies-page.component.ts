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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/store/company/company.model';
import { CompanyQuery } from 'src/app/store/company/company.query';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-companies',
  templateUrl: './companies-page.component.html',
  styleUrls: ['./companies-page.component.scss']
})
export class CompaniesPageComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  companies$: Observable<Company[]>;

  constructor(private companyQuery: CompanyQuery,
              private factoryResolver: FactoryResolver,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading$ = this.companyQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.companies$ = this.companyQuery.selectAll();
  }

  ngOnDestroy() {
  }
}
