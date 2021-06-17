import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameWithVersion'
})
export class NameWithVersionPipe implements PipeTransform {

  transform(value: string, version: bigint | undefined): string {
    return version ? `${value} v.${version}` : value;
  }

}
