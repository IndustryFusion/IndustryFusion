import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'accuracyformat'
})
export class AccuracyFormatPipe extends DecimalPipe implements PipeTransform {

  transform(accuracy: number): any {
    const format = `1.${accuracy.toString()}-${accuracy.toString()}`;
    return super.transform(0.000000, format);
  }

}
