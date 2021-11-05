import { Directive, HostBinding, Optional, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'label[displayControlValue]',
})
export class LabelControlDirective {
  @Input() displayControlValue: string;

  constructor(@Optional() private parent: ControlContainer) { }

  @HostBinding('textContent')
  get controlValue() {
    return this.parent ? this.parent.control.get(this.displayControlValue).value : '';
  }
}
