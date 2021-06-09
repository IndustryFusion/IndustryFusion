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
import { ActivatedRoute } from '@angular/router';
import { FieldQuery } from '../../../../store/field/field-query.service';
import { EcoSystemManagerResolver } from '../../../services/ecosystem-resolver.service';
import { FieldService } from '../../../../store/field/field.service';
import { Field } from '../../../../store/field/field.model';

@Component({
  selector: 'app-field-page',
  templateUrl: './field-page.component.html',
  styleUrls: ['./field-page.component.scss']
})
export class FieldPageComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  field$: Observable<Field>;

  constructor(private fieldQuery: FieldQuery,
              private fieldService: FieldService,
              private activatedRoute: ActivatedRoute,
              private ecoSystemManagerResolver: EcoSystemManagerResolver) { }

  ngOnInit(): void {
    this.isLoading$ = this.fieldQuery.selectLoading();
    this.resolve(this.activatedRoute);
    this.ecoSystemManagerResolver.resolve(this.activatedRoute);
  }

  ngOnDestroy(): void {
    this.fieldQuery.resetError();
  }

  private resolve(activatedRoute: ActivatedRoute) {
    const fieldId = activatedRoute.snapshot.paramMap.get('fieldId');
    if (fieldId != null) {
      this.fieldService.setActive(fieldId);
      this.field$ = this.fieldQuery.selectActive();
    }
  }

}
