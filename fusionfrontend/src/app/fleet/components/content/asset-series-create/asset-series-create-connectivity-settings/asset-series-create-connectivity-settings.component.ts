import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConnectivityTypeQuery } from '../../../../../store/connectivity-type/connectivity-type.query';
import { ConnectivityProtocol, ConnectivityType } from '../../../../../store/connectivity-type/connectivity-type.model';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { FormGroup } from '@angular/forms';
import { AssetSeriesCreateConnectivitySettingsTooltipComponent } from './asset-series-create-connectivity-settings-tooltip/asset-series-create-connectivity-settings-tooltip.component';

@Component({
  selector: 'app-asset-series-create-connectivity-settings',
  templateUrl: './asset-series-create-connectivity-settings.component.html',
  styleUrls: ['./asset-series-create-connectivity-settings.component.scss']
})
export class AssetSeriesCreateConnectivitySettingsComponent implements OnInit {
  @Output() stepChange = new EventEmitter<number>();
  @Output() valid = new EventEmitter<boolean>();
  @Input() assetSeriesForm: FormGroup;

  connectivityTypes: ConnectivityType[];
  connectivityTypes$: Observable<ConnectivityType[]>;
  connectivityProtocols: ConnectivityProtocol[];
  infoText = '';

  AssetSeriesCreateConnectivitySettingsTooltipComponent = AssetSeriesCreateConnectivitySettingsTooltipComponent;

  constructor(private connectivityTypeQuery: ConnectivityTypeQuery) {
    this.mockConnectivityTypes();
  }

  private mockConnectivityTypes() {
    this.connectivityTypes = [];
    this.mockDirectIO();
    this.mockInternalMachineNetwork();
    this.mockNetworkBased();
  }

  ngOnInit(): void {
    this.connectivityTypes$ = this.connectivityTypeQuery.selectAll();
    this.assetSeriesForm.get('connectivityTypeId').setValue(1);
    this.onChangeConnectivityType(1);
  }

  onChangeConnectivityType(connectivityTypeId: ID) {
    if (connectivityTypeId && this.connectivityTypes) {
      const selectedConnectivityType = this.connectivityTypes
        .find(connectivityType => String(connectivityType.id) === String(connectivityTypeId));
      this.connectivityProtocols = selectedConnectivityType.availableProtocols;
      this.infoText = selectedConnectivityType.infoText;

      if (this.connectivityProtocols.length > 0) {
        this.assetSeriesForm.get('protocolId').setValue(this.connectivityProtocols[0].id);
        this.onChangeProtocolType(this.connectivityProtocols[0].id);

      } else {
        this.assetSeriesForm.get('protocolId').setValue(null);
        this.assetSeriesForm.get('connectionString').setValue(null);
      }
    }

    this.updateValidity();
  }

  onChangeProtocolType(connectivityProtocolId: ID) {
    if (connectivityProtocolId && this.connectivityProtocols) {
      const connectionString = this.connectivityProtocols
        .find(connectivityProtocol => String(connectivityProtocol.id) === String(connectivityProtocolId)).connectionString;
      this.assetSeriesForm.get('connectionString').setValue(connectionString);
    }

    this.updateValidity();
  }

  private updateValidity() {
    const isValid = this.assetSeriesForm && this.assetSeriesForm.get('connectivityTypeId').valid
      && this.assetSeriesForm.get('protocolId').valid
      && this.assetSeriesForm.get('connectionString').valid;

    this.valid.emit(isValid);
  }

  // TODO: remove later
  private mockDirectIO() {
    this.connectivityTypes.push({ id: 1, name: 'Direct IO / SoftSPS', infoText: 'Sensors connected directly to the Gateway',
      availableProtocols: [ ] });
  }

  private mockInternalMachineNetwork() {
    const connectivityProtocolModbus: ConnectivityProtocol = new ConnectivityProtocol();
    connectivityProtocolModbus.id = 1;
    connectivityProtocolModbus.connectionString = 'modbus:tcp://127.0.0.1:502';
    connectivityProtocolModbus.name = 'Modbus TCP';

    this.connectivityTypes.push({ id: 2, name: 'Internal Machine Network',
      infoText: 'Gateway is connected 1 to 1 to the Asset (e.g. PLC via Ethernet/Serial)',
      availableProtocols: [ connectivityProtocolModbus ] });
  }

  private mockNetworkBased() {
    const connectivityProtocolMQTT: ConnectivityProtocol = new ConnectivityProtocol();
    connectivityProtocolMQTT.id = 2;
    connectivityProtocolMQTT.connectionString = 'tcp://127.0.0.1:1883';
    connectivityProtocolMQTT.name = 'MQTT';

    const connectivityProtocolSQL: ConnectivityProtocol = new ConnectivityProtocol();
    connectivityProtocolSQL.id = 3;
    connectivityProtocolSQL.connectionString = 'jdbc:sqlserver://127.0.0.1\\SQLEXPRESS;database=TEST';
    connectivityProtocolSQL.name = 'SQL';

    this.connectivityTypes.push({ id: 3, name: 'Network based (e.g. SQL, MQTT)',
      infoText: 'Everything that is connected via the Network (SQL database, MQTT broker)',
      availableProtocols: [ connectivityProtocolMQTT, connectivityProtocolSQL,  ] });
  }
}
