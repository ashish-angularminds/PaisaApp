import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mode',
  standalone: true
})
export class ModePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    switch (value) {
      case 0:
        return "Cash";
      case 1:
        return "UPI";
      case 2:
        return "Credit";
      case 3:
        return "Debit";
      default:
        return "";
    }
  }

}
