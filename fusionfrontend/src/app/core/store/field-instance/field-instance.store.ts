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

import { ActiveState, EntityState, ID, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { CachedStore } from '../cachedstore';
import { FieldInstance } from './field-instance.model';

export interface FieldInstanceState extends EntityState<FieldInstance, ID>, ActiveState { }

const initialState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'field-instance', resettable: true })
export class FieldInstanceStore extends CachedStore<FieldInstanceState, FieldInstance> {

  constructor() {
    super(initialState);
  }

}
