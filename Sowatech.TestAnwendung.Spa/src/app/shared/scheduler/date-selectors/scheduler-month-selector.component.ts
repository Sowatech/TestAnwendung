import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import * as moment from 'moment';
import 'moment/locale/de';

@Component({
  selector: "scheduler-month-selector",
  templateUrl: "scheduler-month-selector.component.html",
  styles: [".month-padding {padding: 0px 4px 4px;}"]
})

export class SchedulerMonthSelectorComponent implements OnInit {
  constructor() {
    this._selectedMonth = new SelectedMonth();
    for (let i = 0; i < 12; i++) {
      let monthName = moment(new Date(2000, i)).format("MMM");
      let month = new MonthsViewModel(monthName, i);
      this.months.push(month);
    }
  }

  ngOnInit() {
    this.selectedMonthChanged();
  }

  public months: Array<MonthsViewModel> = new Array<MonthsViewModel>();

  @Output() onMonthChanged = new EventEmitter<SelectedMonth>();

  @Input() showYear: boolean = false;
  @Input("selectedMonth") set selectedMonth(value: SelectedMonth) {
    if (value) {
      this._selectedMonth.monthIndex = value.monthIndex;
      this._selectedMonth.year = value.year;
    }
  }

  private _date: Date;
  get date(): Date {
    //return this.selectedMonth.date;
    if (this._date)
      return this._date ? this._date : this.selectedMonth.date;
  }

  get selectedMonth(): SelectedMonth {
    return this._selectedMonth;
  }

  private _selectedMonth: SelectedMonth = new SelectedMonth();

  selectMonth(monthIndex: TMonth,year?:number) {
    this._selectedMonth.monthIndex = monthIndex;
    if (year > 0) this._selectedMonth.year = year;
    this._date = this._selectedMonth.date;
    this.selectedMonthChanged();
  }

  increaseYear() {
    this._selectedMonth.monthIndex = TMonth.Jan;
    this._selectedMonth.year += 1;
    this.selectedMonthChanged();
  }

  decreaseYear() {
    this._selectedMonth.monthIndex = TMonth.Dec;
    this._selectedMonth.year -= 1;
    this.selectedMonthChanged();
  }

  private selectedMonthChanged() {
    this.onMonthChanged.emit(this._selectedMonth);
  }
}

enum TMonth { Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec };

export class MonthsViewModel {
  constructor(text: string, value: number) {
    this.text = text;
    this.monthIndex = value;
  }
  text: string;
  monthIndex: number;
  cssClass: string;
}

export class SelectedMonth {
  constructor(date:Date);
  constructor(monthIndex?: TMonth, year?: number);
  constructor(arg1?: any, year?: number)
  {
    if (arg1 instanceof Date) {
      let date = <Date>arg1;
      this.monthIndex = date.getMonth();
      this.year = date.getFullYear();
    }
    else{
      let today = new Date();
      let monthIndex = arg1;
      this.monthIndex = monthIndex ? monthIndex : today.getMonth();
      this.year = year ? year : today.getFullYear();
    }
  }

  monthIndex: number;
  year: number;

  get date(): Date {
    let startOMonth = moment().year(this.year).month(this.monthIndex).startOf("month");
    return startOMonth.toDate();
  }
}
