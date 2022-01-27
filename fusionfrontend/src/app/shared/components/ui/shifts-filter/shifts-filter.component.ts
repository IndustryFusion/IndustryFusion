import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FactorySite, Shift } from '../../../../core/store/factory-site/factory-site.model';
import { Day } from '../../../../core/models/days.model';
import { TranslateService } from '@ngx-translate/core';
import { FactorySiteService } from '../../../../core/store/factory-site/factory-site.service';
import { CompanyQuery } from '../../../../core/store/company/company.query';

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
  shiftsChanged = new EventEmitter<Shift[]>();

  factorySiteOptions: FactorySite[];
  selectedFactorySite: FactorySite;
  shiftOptions: Shift[];
  selectedShifts: Shift[] = [];

  subtitle: string;

  private previousAppliedShifts: Shift[];

  constructor(private translate: TranslateService,
              private companyQuery: CompanyQuery,
              private factorySiteService: FactorySiteService) {  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.day) {
      this.subtitle = this.translate.instant('APP.SHARED.UI.SHIFTS_FILTER.SHIFTS_OF_DAY_LABEL',
        { day: this.translate.instant('APP.COMMON.DAYS.' + this.day) });

      this.remainShiftsWithSameNameAsPreviousOnes();
      this.onApply();
    }
    if (changes.factorySites) {
      this.clearAll();
    }
  }

  private remainShiftsWithSameNameAsPreviousOnes() {
    if (this.previousAppliedShifts) {
      const shiftsOfNewDayWithMatchingNames: Shift[] = [];
      const namesOfPreviousShiftsLowerCase: string[] = this.previousAppliedShifts.map(shift => shift.name.toLowerCase());

      this.updateShiftOptions();
      for (const newShiftOption of this.shiftOptions) {
        if (namesOfPreviousShiftsLowerCase.includes(newShiftOption.name.toLowerCase())) {
          shiftsOfNewDayWithMatchingNames.push(newShiftOption);
        }
      }

      this.previousAppliedShifts = [...shiftsOfNewDayWithMatchingNames];
      this.selectedShifts = this.previousAppliedShifts;
    } else {
      this.clearAll();
    }
  }

  onFactorySiteSelected(): void {
    if (!this.selectedFactorySite.shiftSettings) {
      this.factorySiteService.getFactorySiteWithShiftsSettings(this.companyQuery.getActiveId(), this.selectedFactorySite.id)
        .subscribe(factorySiteWithShiftSettings => {
          this.selectedFactorySite = factorySiteWithShiftSettings;
          this.updateShiftOptions();
        });
    } else {
      this.updateShiftOptions();
    }
  }

  private updateShiftOptions(): void {
    if (!this.day) {
      throw Error('[Shifts filter]: Day is not provided');
    }
    if (!this.selectedFactorySite.shiftSettings) {
      throw Error('[Shifts filter]: Shift settings are not provided. Is the correct resolver being used with shift settings?');
    }

    this.selectedShifts = [];
    this.shiftOptions = [];
    const shiftsOfDay = this.selectedFactorySite.shiftSettings.shiftsOfDays.find(aShiftsOfDay => aShiftsOfDay.day === this.day);

    if (shiftsOfDay) {
      shiftsOfDay.shifts.forEach(shift => this.shiftOptions.push(shift));
    }
  }

  clearAll(): void {
    this.factorySiteOptions = [];
    this.selectedFactorySite = null;
    this.shiftOptions = [];
    this.selectedShifts = [];
    this.previousAppliedShifts = null;
    this.factorySites?.forEach(factorySite => this.factorySiteOptions.push(factorySite));
  }

  onToggleShift(shift: Shift, isChecked: boolean): void {
    if (isChecked) {
      this.selectedShifts.push(shift);
    } else if (shift) {
      const indexArray: number = this.selectedShifts.indexOf(shift);
      this.selectedShifts.splice(indexArray, 1);
    }
  }

  onApply(): void {
    const sortedSelectedShifts = this.selectedShifts.sort((shift1, shift2) => shift1.indexInArray - shift2.indexInArray);
    if (!this.previousAppliedShifts ||
      !this.isArrayEqual(this.previousAppliedShifts.map(shift => shift.id), sortedSelectedShifts.map(shift => shift.id))) {
      this.previousAppliedShifts = [...sortedSelectedShifts];
      this.shiftsChanged.emit(sortedSelectedShifts);
    }
  }

  private isArrayEqual(a: any[], b: any[]): boolean {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

  isShiftSelected(shift: Shift) {
    return this.selectedShifts.includes(shift);
  }
}
