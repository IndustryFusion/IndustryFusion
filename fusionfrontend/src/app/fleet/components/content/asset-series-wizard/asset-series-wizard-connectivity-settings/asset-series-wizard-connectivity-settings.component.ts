import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConnectivityTypeQuery } from '../../../../../store/connectivity-type/connectivity-type.query';
import { ConnectivityProtocol, ConnectivityType } from '../../../../../store/connectivity-type/connectivity-type.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetSeriesWizardConnectivitySettingsTooltipComponent } from './asset-series-wizard-connectivity-settings-tooltip/asset-series-wizard-connectivity-settings-tooltip.component';
import { AssetSeries } from '../../../../../store/asset-series/asset-series.model';
import { DialogType } from '../../../../../common/models/dialog-type.model';

@Component({
  selector: 'app-asset-series-wizard-connectivity-settings',
  templateUrl: './asset-series-wizard-connectivity-settings.component.html',
  styleUrls: ['./asset-series-wizard-connectivity-settings.component.scss']
})
export class AssetSeriesWizardConnectivitySettingsComponent implements OnInit {
  @Input() mode: DialogType;
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
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.disableFormGroupOnEditMode();

    this.updateConnectivityProtocolOptionsAndInfoText();
    if (this.mode === DialogType.CREATE) {
      this.updateConnectivityProtocolIdAndConnectionString();
    }

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

    this.connectivitySettingsForm.patchValue(this.assetSeries.connectivitySettings);
    if (this.mode === DialogType.CREATE) {
      this.selectFirstItemsInDropdowns();
    }
  }

  private disableFormGroupOnEditMode() {
    if (this.mode === DialogType.EDIT) {
      this.connectivitySettingsForm.get('connectivityTypeId').disable( { onlySelf: true });
      this.connectivitySettingsForm.get('connectivityProtocolId').disable( { onlySelf: true });
      this.connectivitySettingsForm.get('connectionString').disable( { onlySelf: true });
    }
  }

  private selectFirstItemsInDropdowns(): void {
    this.connectivitySettingsForm.get('connectivityTypeId').setValue(1);
  }

  private updateConnectivityProtocolOptionsAndInfoText(): void {
    const connectivityTypeId = this.connectivitySettingsForm.get('connectivityTypeId').value;

    if (connectivityTypeId && this.connectivityTypeOptions) {
      const selectedConnectivityType = this.connectivityTypeOptions
        .find(connectivityType => String(connectivityType.id) === String(connectivityTypeId));

      this.connectivityProtocolOptions = selectedConnectivityType.availableProtocols;
      this.infoText = selectedConnectivityType.infoText;
    }
  }

  private updateConnectivityProtocolIdAndConnectionString(): void {
    if (this.connectivityProtocolOptions.length > 0) {
      this.connectivitySettingsForm.get('connectivityProtocolId').setValue(this.connectivityProtocolOptions[0].id);
      this.updateConnectionString();

    } else {
      this.connectivitySettingsForm.get('connectivityProtocolId').setValue(null);
      this.connectivitySettingsForm.get('connectionString').setValue(null);
    }
  }


  onChangeConnectivityType(): void {
    this.updateConnectivityProtocolOptionsAndInfoText();
    this.updateConnectivityProtocolIdAndConnectionString();
  }

  onChangeProtocolType(): void {
    this.updateConnectionString();
  }

  private updateConnectionString() {
    const connectivityProtocolId = this.connectivitySettingsForm.get('connectivityProtocolId').value;

    if (connectivityProtocolId && this.connectivityProtocolOptions) {
      const connectionString = this.connectivityProtocolOptions
        .find(connectivityProtocol => String(connectivityProtocol.id) === String(connectivityProtocolId)).connectionStringPattern;
      this.connectivitySettingsForm.get('connectionString').setValue(connectionString);
    }
  }
}
