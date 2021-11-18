import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringEnumToOptionArray'
})
export class StringEnumToOptionArrayPipe implements PipeTransform {
  transform(enumObject: any) {
    const items = Object.keys(enumObject);
    const itemOptions = items.map(item => ({
      id: item,
      label: `${item.charAt(0).toLocaleUpperCase()}${item.slice(1).toLocaleLowerCase()}`
    }));
    return itemOptions;
  }
}
