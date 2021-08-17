import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConnectivityTypeQuery } from '../../../../../store/connectivity-type/connectivity-type.query';
import { ConnectivityProtocol, ConnectivityType } from '../../../../../store/connectivity-type/connectivity-type.model';
import { ID } from '@datorama/akita';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetSeriesWizardConnectivitySettingsTooltipComponent } from './asset-series-wizard-connectivity-settings-tooltip/asset-series-wizard-connectivity-settings-tooltip.component';
import { AssetSeries } from '../../../../../store/asset-series/asset-series.model';

@Component({
  selector: 'app-asset-series-wizard-connectivity-settings',
  templateUrl: './asset-series-wizard-connectivity-settings.component.html',
  styleUrls: ['./asset-series-wizard-connectivity-settings.component.scss']
})
export class AssetSeriesWizardConnectivitySettingsComponent implements OnInit {
  @Input() assetSeries: AssetSeries;
  @Input() assetSeriesForm: FormGroup;
  @Output() stepChange = new EventEmitter<number>();
  @Output() valid = new EventEmitter<boolean>();

  public connectivitySettingsForm: FormGroup;
  public connectivityTypeOptions: ConnectivityType[];
  public connectivityProtocolOptions: ConnectivityProtocol[];
  public infoText = '';

  AssetSeriesCreateConnectivitySettingsTooltipComponent = AssetSeriesWizardConnectivitySettingsTooltipComponent;

  constructor(private connectivityTypeQuery: ConnectivityTypeQuery,
              private formBuilder: FormBuilder) {
    this.connectivityTypeOptions = this.connectivityTypeQuery.getAll();
    this.createFormGroup();
  }

  ngOnInit(): void {
    this.selectFirstItemsInDropdowns();
    this.assetSeriesForm.addControl('connectivitySettings', this.connectivitySettingsForm);
  }

  private createFormGroup(): void {
    const requiredTextValidator = [Validators.required, Validators.minLength(1), Validators.maxLength(255)];

    this.connectivitySettingsForm = this.formBuilder.group({
      connectivityTypeId: [null, Validators.required],
      connectivityProtocolId: [null, Validators.required],
      connectionString: [null, requiredTextValidator],
    });
    this.connectivitySettingsForm.valueChanges.subscribe(() => this.valid.emit(this.connectivitySettingsForm.valid));

    if (this.assetSeries?.connectivitySettings) {
      this.connectivitySettingsForm.patchValue(this.assetSeries.connectivitySettings);
    }
  }

  private selectFirstItemsInDropdowns(): void {
    this.connectivitySettingsForm.get('connectivityTypeId').setValue(1);
    this.onChangeConnectivityType(1);
  }

  onChangeConnectivityType(connectivityTypeId: ID): void {
    if (connectivityTypeId && this.connectivityTypeOptions) {
      const selectedConnectivityType = this.connectivityTypeOptions
        .find(connectivityType => String(connectivityType.id) === String(connectivityTypeId));
      this.connectivityProtocolOptions = selectedConnectivityType.availableProtocols;
      this.infoText = selectedConnectivityType.infoText;

      if (this.connectivityProtocolOptions.length > 0) {
        this.connectivitySettingsForm.get('connectivityProtocolId').setValue(this.connectivityProtocolOptions[0].id);
        this.onChangeProtocolType(this.connectivityProtocolOptions[0].id);

      } else {
        this.connectivitySettingsForm.get('connectivityProtocolId').setValue(null);
        this.connectivitySettingsForm.get('connectionString').setValue(null);
      }
    }
  }

  onChangeProtocolType(connectivityProtocolId: ID): void {
    if (connectivityProtocolId && this.connectivityProtocolOptions) {
      const connectionString = this.connectivityProtocolOptions
        .find(connectivityProtocol => String(connectivityProtocol.id) === String(connectivityProtocolId)).connectionStringPattern;
      this.connectivitySettingsForm.get('connectionString').setValue(connectionString);
    }
  }
}
