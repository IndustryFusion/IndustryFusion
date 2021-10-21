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

import { Pipe, PipeTransform } from '@angular/core';

class AssetStatusFormat {
  status: string;
  color: string;
}

enum AssetStatus {
  OFFLINE = 'offline',
  IDLE = 'idle',
  RUNNING = 'running',
  ERROR = 'error'
}

// TODO: only the case microstep should be relevant in the end
@Pipe({ name: 'assetStatus' })
export class AssetStatusPipe implements PipeTransform {

  private statuses: Map<string, AssetStatusFormat> = new Map( [
    [ 'running', { status: 'running', color: '#2CA9CE' } ],
    [ 'idle',  { status: 'idle', color: '#454F63'} ],
    [ 'error',  { status: 'error', color: '#A73737'} ],
    [ 'offline',  { status: 'offline', color: '#EAEAEA'} ],
  ]);

  transform(gotData: boolean, type: string, statusValue: string): AssetStatusFormat {
    if (!gotData) {
      return this.statuses.get(AssetStatus.OFFLINE);
    } else { // gotData = true
        switch (type) {
          case 'microstep':
            switch (String(statusValue)) {
              case '0':
                return this.statuses.get(AssetStatus.OFFLINE);
              case '1':
                return this.statuses.get(AssetStatus.IDLE);
              case '2':
                return this.statuses.get(AssetStatus.RUNNING);
              case '3':
                return this.statuses.get(AssetStatus.IDLE);
              default:
                return this.statuses.get(AssetStatus.OFFLINE);
            }
          case 'ZPF':
            switch (String(statusValue)) {
              case 'mldBetriebOn':
                return this.statuses.get(AssetStatus.RUNNING);
              case 'mldBetriebOff':
                return this.statuses.get(AssetStatus.IDLE);
              default:
                return this.statuses.get(AssetStatus.OFFLINE);
            }
          case 'Novus':
            switch (String(statusValue)) {
              case 'mldBetriebOn':
                return this.statuses.get(AssetStatus.RUNNING);
              case 'mldWarningOn':
                return this.statuses.get(AssetStatus.ERROR);
              case 'mldErrorOn':
                return this.statuses.get(AssetStatus.ERROR);
              case 'mldIdleOn':
                return this.statuses.get(AssetStatus.IDLE);
              case 'mldBetriebOff':
                return this.statuses.get(AssetStatus.OFFLINE);
              default:
                return this.statuses.get(AssetStatus.OFFLINE);
            }
          case 'Airtracker':
            return this.statuses.get(AssetStatus.RUNNING);
          case 'Gasversorgung':
            switch (String(statusValue)) {
              case '1':
                return this.statuses.get(AssetStatus.IDLE);
              case '2':
                return this.statuses.get(AssetStatus.RUNNING);
              default:
                return this.statuses.get(AssetStatus.OFFLINE);
            }
          default:
            console.warn('[asset status]: gotData but no type');
            return this.statuses.get(AssetStatus.ERROR);
        }
    }
  }
}
