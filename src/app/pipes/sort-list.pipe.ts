import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortList',
  standalone: true,
})
export class SortListPipe implements PipeTransform {

  transform(value: [], ...args: unknown[]): any {
    if (value) {
      let tmpList = [...value] || [];
      return tmpList.sort((a: any, b: any) => {
        const aDate: any = new Date(b?.createdAt?.seconds);
        const bDate: any = new Date(a?.createdAt?.seconds);
        return aDate - bDate;
      });
    } else {
      return [];
    }
  }

}
