import { RuleStatus } from 'src/app/store/oisp/oisp-rule/oisp-rule.model';

export class RuleStatusUtil {

  private canActivatedStatus = [RuleStatus.Active, RuleStatus.Archived, RuleStatus.OnHold];

  public canActivated(status: RuleStatus) {
    return this.canActivatedStatus.includes(status);
  }

  public isActive(status: RuleStatus) {
    return status === RuleStatus.Active;
  }
}
