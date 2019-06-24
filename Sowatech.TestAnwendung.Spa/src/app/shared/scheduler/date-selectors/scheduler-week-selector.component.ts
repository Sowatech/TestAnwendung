import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment';
import { Moment } from "moment";
import 'moment/locale/de';
import { LoggerService } from "../../utilities/logger.service";

const CLASS = "SchedulerWeekSelectorComponent";

@Component({
  selector: "scheduler-week-selector",
  templateUrl: "scheduler-week-selector.component.html",
  styles: [".month-padding {padding: 0px 4px 4px;}"]
})

export class SchedulerWeekSelectorComponent implements OnInit {
  constructor(
    private logger:LoggerService
  ) {
    this.selectedWeek = new SelectedWeek();
    this.month = moment().month();
    this.year = moment().year();
  }

  ngOnInit() {
    this.logger.log(CLASS + ".ngOnInit()");
    this.initWeeks(this.selectedWeek.isoWeek);
    this.onInitFinished = true;
  }

  private onInitFinished: boolean = false;
  
  private month: TMonth;
  private year: number;
  public weeks: Array<WeekViewModel> = new Array<WeekViewModel>();

  @Output() onWeekChanged = new EventEmitter<SelectedWeek>();

  @Input() showYear: boolean = false;
  @Input('date') set date(value: Date) {
    let valueMoment = moment(value);
    this.year = valueMoment.year();
    this.month = valueMoment.month();
    let isoWeek = moment().year(this.year).month(this.month).isoWeek();
    if (this.onInitFinished) this.initWeeks(isoWeek);
  }

  private _date: Date;
  get date(): Date {
    //return this.selectedWeek.date;
    if (this._date) 
      return this._date ? this._date : this.selectedWeek.date;
  }

  private initWeeks(selectIsoWeek?: number) {
    this.logger.log(CLASS + ".initWeeks() selectIsoWeek=" + selectIsoWeek);
    let monthMoment;
    if (selectIsoWeek) {
      monthMoment = moment().year(this.year).isoWeek(selectIsoWeek);
    }
    else {
      monthMoment = moment().year(this.year).month(this.month).startOf("month");
    }
    
    let startIsoWeek = monthMoment.isoWeek();
    let nextMonthMoment = monthMoment.clone().add(1, "month");
    let lastIsoWeek = nextMonthMoment.isoWeek() - 1;
    if (lastIsoWeek < 1) {
      lastIsoWeek = monthMoment.isoWeeksInYear();
    }
    
    this.weeks = [];
    for (let isoWeek = startIsoWeek; isoWeek <= lastIsoWeek; isoWeek++) {
      let week = new WeekViewModel(this.year, isoWeek);
      this.weeks.push(week);
    }

    this.selectedWeek.year = this.year;
    this.selectWeek(selectIsoWeek ? selectIsoWeek : startIsoWeek);
  }

  public selectedWeek: SelectedWeek;

  selectWeek(isoWeek: number) {
    this.logger.log(CLASS + ".selectWeek");
    this.selectedWeek.isoWeek = isoWeek;
    this.selectedWeek.year = this.year;
    this._date = this.selectedWeek.date;
    this.selectedWeekChanged();
  }

  increaseMonth() {
    if (this.month == TMonth.Dec) {
      this.month = TMonth.Jan;
      this.year++;
    }
    else {
      this.month++;
    }
    this.initWeeks();
  }

  decreaseMonth() {
    if (this.month == TMonth.Jan) {
      this.month = TMonth.Dec;
      this.year--;
    }
    else{
      this.month--;

    }
    this.initWeeks();
  }

  private selectedWeekChanged() {
    this.logger.log(CLASS + ".selectedWeekChanged: isoWeek=" + this.selectedWeek.isoWeek);
    this.onWeekChanged.emit(this.selectedWeek);
  }
}

enum TMonth { Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec };

export class WeekViewModel {
  constructor(year: number, isoWeek: number) {
    this.isoWeek = isoWeek;
    this.year = year;
    this.setDate();
  }
  
  isoWeek: number;
  year: number;
  date: Date;
  cssClass: string;

  private setDate() {
    let startOfIsoWeek = moment().year(this.year).isoWeek(this.isoWeek).startOf("week");
    this.date = startOfIsoWeek.toDate();
  }
}

export class SelectedWeek {
  constructor() {
    this.isoWeek = moment().isoWeek();
    this.year = moment().isoWeek(this.isoWeek).year();
  }
  isoWeek: number;
  year: number;

  get date(): Date {
    let startOfIsoWeek = moment().year(this.year).isoWeek(this.isoWeek).startOf("week");
    return startOfIsoWeek.toDate();
  }
}
