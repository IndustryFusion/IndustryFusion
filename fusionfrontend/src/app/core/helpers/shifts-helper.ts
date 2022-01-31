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

import { Day } from '../models/days.model';
import { Milliseconds, Minutes, Shift, ShiftSettings, ShiftWithDate } from '../store/factory-site/factory-site.model';
import * as moment from 'moment';

export class ShiftsHelper {

  private static readonly MINUTES_PER_DAY = 24 * 60;
  private static readonly MILLISECONDS_PER_MINUTE = 60 * 1000;

  public static getDayFromDate(date: Date): Day {
    switch (date.getDay()) {
    case 0: return Day.SUNDAY;
    case 1: return Day.MONDAY;
    case 2: return Day.TUESDAY;
    case 3: return Day.WEDNESDAY;
    case 4: return Day.THURSDAY;
    case 5: return Day.FRIDAY;
    case 6: return Day.SATURDAY;
    }
  }

  public static sortShiftsUsingStart(shifts: Shift[]) {
    return shifts.sort((shift1, shift2) => shift1.startMinutes - shift2.startMinutes);
  }

  public static sortShiftsUsingCorrectedEndDesc(shifts: Shift[]) {
    return shifts.sort((shift1, shift2) =>
      this.getCorrectedEndMinutes(shift2) - this.getCorrectedEndMinutes(shift1));
  }

  public static sortShiftsUsingInsertionOrder(shifts: Shift[]) {
    return shifts.sort((shift1, shift2) => shift1.indexInArray - shift2.indexInArray);
  }

  public static getCorrectedEndMinutes(shift: Shift) {
    const isShiftExceedingMidnight = shift.endMinutes < shift.startMinutes;
    return shift.endMinutes + (isShiftExceedingMidnight ? this.MINUTES_PER_DAY : 0);
  }

  public static getLastNCompletedShiftsWithDate(shiftSettings: ShiftSettings, n: number): ShiftWithDate[] {
    const lastNShiftsWithDate: ShiftWithDate[] = [];

    if (shiftSettings && this.getShiftCountOfShiftSettings(shiftSettings) > 0) {
      let date: Date = new Date(Date.now());

      while (lastNShiftsWithDate.length < n) {
        const day = ShiftsHelper.getDayFromDate(date);
        const shiftsOfDay = shiftSettings.shiftsOfDays.find(aShiftsOfDay => aShiftsOfDay.day === day);

        if (shiftsOfDay.shifts.length > 0) {
          const shiftsCopy = [...shiftsOfDay.shifts];
          const sortedCompletedShifts = this.sortShiftsUsingCorrectedEndDesc(shiftsCopy)
            .filter(shift => this.isShiftCompleted(shift, date));

          for (const shift of sortedCompletedShifts) {
            if (lastNShiftsWithDate.length < n) {
              lastNShiftsWithDate.push(new ShiftWithDate(shift, new Date(date.toDateString())));
            }
          }
        }

        date = new Date(moment(date).subtract(1, 'days').valueOf());
      }
    }

    return lastNShiftsWithDate;
  }

  private static isShiftCompleted(shift: Shift, date: Date) {
    const now = new Date(Date.now());
    const dayStartTimestampMs: Milliseconds = new Date(date.toDateString()).valueOf();
    const endOfShiftTimestampMs: Milliseconds = dayStartTimestampMs + this.convertMinutesToMilliseconds(this.getCorrectedEndMinutes(shift));

    return now.valueOf() > endOfShiftTimestampMs;
  }

  private static convertMinutesToMilliseconds(minutes: Minutes): Milliseconds {
    return minutes * this.MILLISECONDS_PER_MINUTE;
  }

  private static getShiftCountOfShiftSettings(shiftSettings: ShiftSettings): number {
    let shiftCount = 0;
    shiftSettings?.shiftsOfDays.forEach(shiftsOfDay => shiftCount += shiftsOfDay.shifts.length);
    return shiftCount;
  }
}
