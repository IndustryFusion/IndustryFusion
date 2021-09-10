import { OispDeviceStatus } from './kairos.model';
import { ID } from '@datorama/akita';

export class StatusHours {
  status: OispDeviceStatus;
  hours: number;
}

export class AssetStatusHours {
  assetId: ID;
  statusHours: StatusHours[];
}
