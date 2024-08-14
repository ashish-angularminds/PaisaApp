import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fullDate',
  standalone: true
})
export class FullDatePipe implements PipeTransform {

  transform(date: any, ...args: unknown[]): any {
    return (new Date(date.seconds).toLocaleDateString()) + " - " + (new Date(date.seconds).toLocaleTimeString('en-US'));
  }

}
