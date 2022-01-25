import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FactorySite, Shift } from '../../../../core/store/factory-site/factory-site.model';
import { Day } from '../../../../core/models/days.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-shifts-filter',
  templateUrl: './shifts-filter.component.html',
  styleUrls: ['./shifts-filter.component.scss']
})
export class ShiftsFilterComponent implements OnInit, OnChanges {

  @Input()
  factorySites: FactorySite[];
  @Input()
  day: Day;
  @Output()
  shiftsSelected = new EventEmitter<Shift[]>();

  factorySiteOptions: FactorySite[];
  shiftOptions: Shift[] = [];
  selectedFactorySite: FactorySite;
  selectedShifts: Shift[] = [];

  subtitle: string;

  constructor(private translate: TranslateService) {  }

  ngOnInit() {
    this.subtitle = this.translate.instant('APP.SHARED.UI.SHIFTS_FILTER.SHIFTS_OF_DAY_LABEL',
      { day: this.translate.instant('APP.COMMON.DAYS.' + this.day) });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.factorySites) {
      this.factorySiteOptions = [];
      this.selectedFactorySite = null;
      // TODO: shifts
      this.factorySites.forEach(factorySite => this.factorySiteOptions.push(factorySite));
    }
  }

  onFactorySiteSelected(): void {
    this.updateShiftOptions();
  }

  private updateShiftOptions(): void {
    if (!this.day) {
      throw Error('[Shifts filter]: Day is not provided');
    }
    if (!this.selectedFactorySite.shiftSettings) {
      throw Error('[Shifts filter]: Shift settings are not provided. Correct Resolver?');
    }

    this.selectedShifts = [];
    this.shiftOptions = [];
    const shiftsOfDay = this.selectedFactorySite.shiftSettings.shiftsOfDays.find(aShiftsOfDay => aShiftsOfDay.day === this.day);

    if (shiftsOfDay) {
      shiftsOfDay.shifts.forEach(shift => this.shiftOptions.push(shift));
    }
  }

  clear(): void {
    this.selectedFactorySite = null;
    this.selectedShifts = [];
    this.shiftOptions = [];
  }

  onToggleShift(shift: Shift, isChecked: boolean): void {
    if (isChecked) {
      this.selectedShifts.push(shift);
    } else if (shift) {
      const indexArray: number =  this.selectedShifts.indexOf(shift);
      this.selectedShifts.splice(indexArray, 1);
    }
  }

  onApply(): void {
    this.shiftsSelected.emit(this.selectedShifts.sort((a, b) => a.indexInArray - b.indexInArray));
  }

  isShiftSelected(shift: Shift) {
    return this.selectedShifts.includes(shift);
  }
}
