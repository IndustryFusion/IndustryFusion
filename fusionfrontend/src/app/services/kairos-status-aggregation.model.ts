import { OispDeviceStatus } from './kairos.model';

export class StatusHours {
  status: OispDeviceStatus;
  hours: number;
}

export class StatusHoursOneDay {
  statusHours: StatusHours[];

  constructor(statusHours: StatusHours[]) {
    this.statusHours = statusHours;
  }
}
