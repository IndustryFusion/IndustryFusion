import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { FieldSource } from '../../../../../store/field-source/field-source.model';
import { AssetSeries } from '../../../../../store/asset-series/asset-series.model';
import { ID } from '@datorama/akita';
import { Unit } from '../../../../../store/unit/unit.model';
import { UnitQuery } from '../../../../../store/unit/unit.query';
import { FieldSourceService } from '../../../../../store/field-source/field-source.service';
import { FieldSourceComposedQuery } from '../../../../../store/composed/field-source-composed.query';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-asset-series-create-step-four',
  templateUrl: './asset-series-create-step-four.component.html',
  styleUrls: ['./asset-series-create-step-four.component.scss']
})
export class AssetSeriesCreateStepFourComponent implements OnInit {

  @Output() stepChange = new EventEmitter<number>();
  @Output() errorSignal = new EventEmitter<string>();
  @Input() assetSeries: AssetSeries;
  @Input() assetSeries$: Observable<AssetSeries>;

  fieldSources$: Observable<FieldSource[]>;
  $loading: Observable<boolean>;

  constructor(activatedRoute: ActivatedRoute,
              private unitQuery: UnitQuery,
              private fieldSourceComposedQuery: FieldSourceComposedQuery,
              private fieldSourceService: FieldSourceService) {
    this.$loading = this.fieldSourceComposedQuery.selectLoading();
    const id: ID = activatedRoute.snapshot.queryParamMap.get('id')
    if (id) {
      this.fieldSources$ = this.fieldSourceComposedQuery.selectFieldSourcesWithUnitsByAssetSeries(id);
    }
  }

  ngOnInit(): void {
  }

  updateRegister(register: string, fieldSource: FieldSource) {
    fieldSource = { ...fieldSource}
    fieldSource.register = register;
    this.fieldSourceService.editItem(this.assetSeries.companyId, fieldSource).subscribe();
  }

  getUnitsByQuantityType(quantityTypeId: ID): Unit[] {
    return this.unitQuery.getAll().filter(unit => unit.quantityTypeId === quantityTypeId);
  }

  updateUnit(selectedIndex: number, fieldSource: FieldSource) {
    const units: Unit[] = this.getUnitsByQuantityType(fieldSource.sourceUnit.quantityTypeId);
    fieldSource = { ...fieldSource};
    fieldSource.sourceUnitId = units[selectedIndex].id;
    this.fieldSourceService.updateUnit(this.assetSeries.companyId, fieldSource).subscribe();
  }
}
