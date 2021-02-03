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

class MyFormat {
  status: string;
  color: string;
}

// TODO: only the case microstep should be relevant in the end
@Pipe({ name: 'fusionformat' })
export class FusionFormatPipe implements PipeTransform {
  transform(gotData: boolean, type: string, statusValue: string): MyFormat {
    if (!gotData) {
      if (type === 'nofields') {
        return ({ status: 'no status available', color: '#4f504f'})
      } else {
        return ({ status: 'offline', color: '#4f504f'});
      }
    } else { // gotData = true
        switch (type) {
          case 'microstep':
            switch (String(statusValue)) {
              case '0':
                return ({ status: 'offline', color: '#4f504f'});
              case '1':
                return ({ status: 'idle', color: '#2CA9CE'});
              case '2':
                return ({ status: 'running', color: 'rgba(44,206,79,0.73)'});
              case '3':
                return ({ status: 'idle', color: '#2CA9CE'});
              default:
                return ({ status: 'no status available', color: '#e80707'});
            }
          case 'ZPF':
            switch (String(statusValue)) {
              case 'mldBetriebOn':
                return ({ status: 'running', color: 'rgba(44,206,79,0.73)'});
              case 'mldBetriebOff':
                return ({ status: 'idle', color: '#2CA9CE'});
              default:
                return ({ status: 'no status available', color: '#e80707'});
            }
          case 'Novus':
            switch (String(statusValue)) {
              case 'mldBetriebOn':
                return ({ status: 'running', color: 'rgba(44,206,79,0.73)'});
              case 'mldWarningOn':
                return ({ status: 'Warning', color: '#e80707'});
              case 'mldErrorOn':
                return ({ status: 'Error', color: '#e80707'});
              case 'mldIdleOn':
                return ({ status: 'idle', color: '#2CA9CE'});
              case 'mldBetriebOff':
                return ({ status: 'offline', color: '#4f504f'});
              default:
                return ({ status: 'no status available', color: '#e80707'});
            }
          case 'Airtracker':
            return ({ status: 'running', color: 'rgba(44,206,79,0.73)'});
          case 'Gasversorgung':
            switch (String(statusValue)) {
              case '1':
                return ({ status: 'idle', color: '#2CA9CE'});
              case '2':
                return ({ status: 'running', color: 'rgba(44,206,79,0.73)'});
              default:
                return ({ status: 'no status available', color: '#e80707'});
            }
          default:
            return ({ status: 'gotData but no type', color: '#e80707'});
        }
    }
  }
}
