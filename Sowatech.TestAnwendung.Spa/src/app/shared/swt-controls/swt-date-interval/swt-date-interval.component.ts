import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';

import { DropDownContainerComponent } from '../swt-dropdown-container.component';
import { SwtDateIntervalStoreHelper } from './swt-date-interval-store.service';
import { DateInterval, TIntervalSelectType } from './swt-date-interval.model';

@Component({
    selector: 'swt-date-interval',
    moduleId: module.id,
    templateUrl: './swt-date-interval.component.html',
    providers: [SwtDateIntervalStoreHelper]
})
export class SwtDateIntervalComponent implements OnInit, OnDestroy {

    constructor(
        private storeHelper: SwtDateIntervalStoreHelper
    ) {
    }

    @Input('store-key') storeKey: string;

    @Input('selectItems') set setintervalValues(values: Array<TIntervalSelectType>) {
        this.setSelectItemsValues(values);
    };

    @Input('selectedDate') set setSelectedDate(value: Date | string) {
        let valueMoment = moment(value);
        this.setCurrentInterval(valueMoment);
    }

    @Output('change') changeEventEmitter = new EventEmitter<DateInterval>();
    @ViewChild('swtcontainer') swtcontainer: DropDownContainerComponent;
    @ViewChild('swtFromcontainer') swtFromcontainer: DropDownContainerComponent;

    subscriptions: Array<Subscription> = [];

    ngOnInit() {
        this.subscriptions.push(
            //
        );

        let storeData = this.storeHelper.loadFromStorage(this.storeKey);
        let hasStoreData = this.storeKey && storeData.intervalSelectType != null && storeData.intervalSelectType != "";
        if (hasStoreData) {
            this.intervalSelectType = storeData.intervalSelectType;
            this.currentInterval = new DateInterval(storeData.start, storeData.end);
        }
        else {
            this.intervalSelectType = this.selectItems.length > 0 ? this.selectItems[0].value : 1;
            this.currentInterval = new DateInterval();
        }
        this.setCurrentInterval(this.currentInterval.startMoment, this.currentInterval.endMoment);
    }

    ngOnDestroy() {
        for (let subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    currentInterval: DateInterval = new DateInterval();

    public getSelectedInterval(): DateInterval {
        return this.currentInterval;//obsolete. noch enthalten aus backwardcompatibilitaet
    }

    delimiter: string = "von";
    intervalSelectType: TIntervalSelectType = 0;
    selectItems: Array<SelectItem>;

    onIntervalChange() {
        this.setCurrentInterval(this.currentInterval.startMoment, this.currentInterval.endMoment);
    }

    selectedMonth: TMonthIndex;
    selectedYear: number;

    onMonthYearChange() {
        if (this.selectedYear < 1900) this.selectedYear = 1900;
        if (this.selectedYear > 3000) this.selectedYear = 3000;
        let momentStart: moment.Moment;
        let momentEnd: moment.Moment;
        if (this.intervalSelectType == "currentyear") {
            momentStart = moment([this.selectedYear, TMonthIndex.jan, 1]);
            momentEnd = momentStart.endOf('year');
        }
        else {
            momentStart = moment([this.selectedYear, this.selectedMonth, 1]);
            momentEnd = momentStart.endOf('month');
        } 
        this.setCurrentInterval(momentStart, momentEnd);
    }

    selectedYearAdd(addYear: number) {
        this.selectedYear = addYear + this.selectedYear;
        this.onMonthYearChange();
    }

    startEndError: boolean = false;
    fromDatePickerVisible: boolean = false;
    datepickervisible: boolean = true;
    monthvisible: boolean = false;
    yearvisible: boolean = false;
    isInChange = false;

    months: Array<SelectItem> = [
        { text: "Januar", value: TMonthIndex.jan },
        { text: "Februar", value: TMonthIndex.feb },
        { text: "März", value: TMonthIndex.mar },
        { text: "April", value: TMonthIndex.apr },
        { text: "Mai", value: TMonthIndex.may },
        { text: "Juni", value: TMonthIndex.jun },
        { text: "Juli", value: TMonthIndex.jul },
        { text: "August", value: TMonthIndex.aug },
        { text: "September", value: TMonthIndex.sep },
        { text: "Oktober", value: TMonthIndex.oct },
        { text: "November", value: TMonthIndex.nov },
        { text: "Dezember", value: TMonthIndex.dec }
    ];

    private setSelectItemsValues(values: Array<TIntervalSelectType>) {
        this.selectItems = [];
        let selectItem: SelectItem;
        for (let itemValue of values) {
            if (typeof itemValue == "string") {
                switch (itemValue) {
                    case "lastmonth":
                        selectItem = { value: "lastmonth", text: "Letzter Monat" };
                        break;
                    case "lastyear":
                        selectItem = { value: "lastyear", text: "Letztes Jahr" };
                        break;
                    case "lastquarter":
                        selectItem = { value: "lastquarter", text: "Letztes Quartal" };
                        break;
                    case "day":
                    case "currentday":
                        selectItem = { value: "day", text: "Selber Tag" };
                        break;
                    case "currentmonth":
                        selectItem = { value: "currentmonth", text: "Monat" };
                        break;
                    case "currentquarter":
                        selectItem = { value: "currentquarter", text: "Aktuelles Quartal" };
                        break;
                    case "currentyear":
                        selectItem = { value: "currentyear", text: "Jahr" };
                        break;
                    case "interval":
                        selectItem = { value: "interval", text: "Zeitraum" };
                        break;
                }
            }
            else {
                let itemText = itemValue == 1 ?
                    "Letzter Tag" :
                    `Letzte ${itemValue} Tage`;
                selectItem = { value: itemValue, text: itemText };
            }
            this.selectItems.push(selectItem);
        }
    }

    private oldInterval;
    private setCurrentInterval(start: moment.Moment, end?: moment.Moment) {
        if (!end) end = start.clone();
        this.startEndError = false;
        this.refreshControlVisibility();
        switch (this.intervalSelectType) {
            case "lastmonth":
                if (end.month() > TMonthIndex.jan) {
                    this.currentInterval.setStart(moment([end.year(), end.month() - 1, 1]));
                    this.currentInterval.setEnd(end.date(1).subtract(1, 'day'));
                }
                else {
                    let lastYear = end.year() - 1;
                    this.currentInterval.setStart(moment([lastYear, TMonthIndex.dec, 1]));
                    this.currentInterval.setEnd(moment([lastYear, TMonthIndex.dec, 31]));
                }
                this.delimiter = "vor";
                break;
            case "currentmonth":
                this.currentInterval.setStart(moment([end.year(), end.month(), 1]));
                let firstDayOfNextMonth: moment.Moment;
                if (end.month() < TMonthIndex.dec) {
                    firstDayOfNextMonth = moment([end.year(), end.month() + 1, 1]);
                }
                else {
                    firstDayOfNextMonth = moment([end.year() + 1, TMonthIndex.jan, 1]);
                }
                this.currentInterval.setEnd(firstDayOfNextMonth.subtract(1, 'day'));
                this.delimiter = "zu";
                break;
            case "lastyear":
                let lastYear = end.year() - 1;
                this.currentInterval.setStart(moment([lastYear, TMonthIndex.jan, 1]));
                this.currentInterval.setEnd(moment([lastYear, TMonthIndex.dec, 31]));
                this.delimiter = "vor";
                break;
            case "currentyear":
                let currentYear = end.year();
                this.currentInterval.setStart(moment([currentYear, TMonthIndex.jan, 1]));
                this.currentInterval.setEnd(moment([currentYear, TMonthIndex.dec, 31]));
                this.delimiter = "zu";
                break;
            case "lastquarter":
                var inputEndMonth: TMonthIndex = end.month();
                var thisyear = end.year();
                if (inputEndMonth >= TMonthIndex.jan && inputEndMonth <= TMonthIndex.mar) {
                    let lastYear = end.year() - 1;
                    this.currentInterval.setStart(moment([lastYear, TMonthIndex.oct, 1]));
                    this.currentInterval.setEnd(moment([lastYear, TMonthIndex.dec, 31]));
                }
                if (inputEndMonth >= TMonthIndex.apr && inputEndMonth <= TMonthIndex.jun) {
                    this.currentInterval.setStart(moment([thisyear, TMonthIndex.jan, 1]));
                    this.currentInterval.setEnd(moment([thisyear, TMonthIndex.mar, 31]));
                }
                if (inputEndMonth >= TMonthIndex.jul && inputEndMonth <= TMonthIndex.sep) {
                    this.currentInterval.setStart(moment([thisyear, TMonthIndex.apr, 1]));
                    this.currentInterval.setEnd(moment([thisyear, TMonthIndex.jun, 30]));
                }
                if (inputEndMonth >= TMonthIndex.oct && inputEndMonth <= TMonthIndex.dec) {
                    this.currentInterval.setStart(moment([thisyear, TMonthIndex.jul, 1]));
                    this.currentInterval.setEnd(moment([thisyear, TMonthIndex.sep, 30]));
                }
                this.delimiter = "vor";
                break;
            case "currentquarter":
                var inputEndMonth: TMonthIndex = end.month();
                var thisyear = end.year();
                if (inputEndMonth >= TMonthIndex.jan && inputEndMonth <= TMonthIndex.mar) {
                    this.currentInterval.setStart(moment([thisyear, TMonthIndex.jan, 1]));
                    this.currentInterval.setEnd(moment([thisyear, TMonthIndex.mar, 31]));
                }
                if (inputEndMonth >= TMonthIndex.apr && inputEndMonth <= TMonthIndex.jun) {
                    this.currentInterval.setStart(moment([thisyear, TMonthIndex.apr, 1]));
                    this.currentInterval.setEnd(moment([thisyear, TMonthIndex.jun, 30]));
                }
                if (inputEndMonth >= TMonthIndex.jul && inputEndMonth <= TMonthIndex.sep) {
                    this.currentInterval.setStart(moment([thisyear, TMonthIndex.jul, 1]));
                    this.currentInterval.setEnd(moment([thisyear, TMonthIndex.sep, 30]));
                }
                if (inputEndMonth >= TMonthIndex.oct && inputEndMonth <= TMonthIndex.dec) {
                    this.currentInterval.setStart(moment([thisyear, TMonthIndex.oct, 1]));
                    this.currentInterval.setEnd(moment([thisyear, TMonthIndex.dec, 31]));
                }
                this.delimiter = "zu";
                break;
            case "day":
                this.currentInterval.setStart(end);
                this.currentInterval.setEnd(end);
                this.delimiter = "am";
                break;
            case "interval":
                if (end < start) this.startEndError = true;
                this.currentInterval.setStart(start);
                this.currentInterval.setEnd(end);
                this.delimiter = "bis";
                break;
            default:
                let intervalDays: number = +this.intervalSelectType;
                let dateBefore = moment(end).subtract(intervalDays-1, 'day');
                this.currentInterval.setStart(dateBefore);
                this.currentInterval.setEnd(end);
                //this.currentInterval.End = intervalDays == 0 ? date.clearTime(inputIntervalEndDatum) : date.clearTime(date.addDays(inputIntervalEndDatum, -1));
                break;
        }

        this.selectedMonth = this.currentInterval.endMoment.month();
        this.selectedYear = this.currentInterval.endMoment.year();

        if (!this.oldInterval || this.oldInterval.start != this.currentInterval.start || this.oldInterval.end != this.currentInterval.end) {
            this.saveToStorage();
            this.changeEventEmitter.emit(this.currentInterval);
        }
        this.oldInterval = new DateInterval(this.currentInterval.startDate, this.currentInterval.endDate);
    }

    private saveToStorage() {
        if (this.storeKey) {
            this.storeHelper.saveToStorage(this.storeKey, this.currentInterval.start, this.currentInterval.end, this.intervalSelectType);
        }
    }

    private refreshControlVisibility() {
        this.datepickervisible = false;
        this.monthvisible = false;
        this.yearvisible = false;
        this.fromDatePickerVisible = false;
        switch (this.intervalSelectType) {
            case "lastmonth":
            case "currentmonth":
                this.monthvisible = true;
                break;
            case "lastyear":
            case "currentyear":
                this.yearvisible = true;
                break;
            case "interval":
                this.fromDatePickerVisible = true;
                this.datepickervisible = true;
                break;
            case "currentday":
            case "lastquarter":
            case "day":
            case "currentquarter":
            default:
                this.datepickervisible = true;
                break;
        }
    }

    private onInputChange(eventData: Event|string, collapseContainer?: DropDownContainerComponent) {
        if (collapseContainer) collapseContainer.collapse();
        if (eventData && typeof (eventData) != "string") {
            eventData.stopPropagation();
        }
    }
}

enum TMonthIndex {
    jan = 0,
    feb = 1,
    mar = 2,
    apr = 3,
    may = 4,
    jun = 5,
    jul = 6,
    aug = 7,
    sep = 8,
    oct = 9,
    nov = 10,
    dec = 11
}


