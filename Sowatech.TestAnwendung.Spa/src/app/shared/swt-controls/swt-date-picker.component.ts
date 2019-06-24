//see http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel

import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as moment from 'moment';

import { Translation, TranslationService, Language, LocaleService } from 'angular-l10n';

const noop = () => { };

export const SWT_DATE_PICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SwtDatePickerComponent),
    multi: true
};

@Component({
    selector: 'swt-date-picker',
    templateUrl: "./swt-date-picker.component.html",
    providers: [SWT_DATE_PICKER_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush, //https://angular-2-training-book.rangle.io/handout/change-detection/change_detection_strategy_onpush.html
    styles: [`
        th,
                td {
                    height: 16%;
                    width: 14% !important;
                }
        
        th {
                    width: 2% !important;
                }
        
        .datepicker-days, table {
                    height: 100%;
                }
        
        table {
                    width: 100%
        }
        
                    .second-color {
                        color: #aca9a9
                    }
        
                        .bg-marked {
                            background-color: #bffab6;
                        }
        
                            .bg-today {
                                background-color: #e7e5e5
                            }
        
                                .bg-selected {
                    background-color: #1c84c6;
                }
        `
    ],
})

export class SwtDatePickerComponent implements ControlValueAccessor {

    constructor(
        public translation: TranslationService,
        public locale: LocaleService
    ) {
        moment.locale(this.locale.getCurrentLocale());
        for (let i = 0; i < 7; i++) {
             this.daysOfWeek.push(moment().day(i + 1).format("ddd"));// + 1 for Monday as first week of day | read for bubble behahvior https://momentjscom.readthedocs.io/en/latest/moment/02-get-set/06-day/
        }
        this.startDate = moment();
        this.currentMonth = this.startDate.month();
        this.currentYear = this.startDate.year();
        this.yearInCenterView = this.currentYear;
    }
    @Language() lang: string;

    ngOnInit() {
        this.refreshStartEndDate();
    }

    @Input('modusYear') modusYear: boolean = true;

    @Input('markedDays') set markedDays(value: Date[]) {
        this._markedDays = value;
        this.buildMonth();
    }
    get markedDays(): Date[] {
        return this._markedDays;
    }
    private _markedDays: Date[];

    private startDate: moment.Moment;
    private endDate: moment.Moment;
    currentMonth: number;
    private currentYear: number;
    weeks: DatePickerWeekViewModel[] = [];
    daysOfWeek: string[] = [];
    public displayModus: DisplayModus = DisplayModus.Days;
    public yearAuswahl = new Array<Array<number>>(new Array<number>()); // [zeilen][years]
    private yearInCenterView: number;

    //----------------------

    //The internal data model
    private innerValue: moment.Moment = moment();

    //Placeholders for the callbacks which are later provided by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    //From ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    //From ControlValueAccessor interface
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    //get accessor
    get value(): string | Date {
        return this.valueType == ValueType.DateString ? this.innerValue.format("YYYY-MM-DD") : this.innerValue.toDate();
    };

    //set accessor including call the onchange callback
    set value(v: string | Date) {
        if (v !== this.value) {
            this.valueType = (typeof (v) == "string") ? ValueType.DateString : ValueType.DateObject;
            this.innerValue = moment(v);
            this.onChangeCallback(v);
        }
    }

    public refresh() {
        this.select(moment(this.value).toDate());
    }

    writeValue(v: string | Date) {
        if (v == undefined) {
            this.valueType = ValueType.Undefined;
            v = moment().format("YYYY-MM-DD");
        }
        if (this.valueType == ValueType.Undefined) {
            this.valueType = (typeof (v) == "string") ? ValueType.DateString : ValueType.DateObject;
        }
        this.innerValue = moment(v);
        this.currentMonth = this.innerValue.month();
        this.currentYear = this.innerValue.year();
        this.refreshStartEndDate();
    }

    //---------------------
    private valueType = ValueType.Undefined;

    @Output('change') valueChange: EventEmitter<string | Date> = new EventEmitter<string | Date>();
    @Output('changeMonth') changeMonth: EventEmitter<{ startDay: Date, endDay: Date }> = new EventEmitter<{ startDay: Date, endDay: Date }>();

    public select(date: Date) {
        let newDate = this.innerValue.toDate();
        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        this.innerValue = moment(newDate);
        this.valueChange.emit(this.value);
        this.onChangeCallback(this.value);//From ControlValueAccessor interface
    }

    get currentMonthAndYear(): Date {
        return new Date(this.currentYear, this.currentMonth);
    }


    public next(): void {
        if (this.displayModus == DisplayModus.Days) {
            this.displayNextMonth();
        } else {
            this.displayNextYears();
        }

    }

    public previous(): void {
        if (this.displayModus == DisplayModus.Days) {
            this.displayPreviousMonth();
        } else {
            this.displayPreviousYears();
        }
    }

    private displayNextMonth() {
        if (this.currentMonth < 11)++this.currentMonth;
        else { this.currentMonth = 0; this.currentYear++; }
        this.refreshStartEndDate();
    }

    private displayNextYears() {
        this.yearInCenterView = this.yearInCenterView + 25;
        this.fillYearAuswahlArray();
    }

    private displayPreviousMonth() {
        if (this.currentMonth > 0)--this.currentMonth;
        else { this.currentMonth = 11; this.currentYear--; }
        this.refreshStartEndDate();
    }

    private displayPreviousYears() {
        this.yearInCenterView = this.yearInCenterView - 25;
        this.fillYearAuswahlArray();
    }


    private refreshStartEndDate() {
        let month: moment.Moment = this.startDate.clone().month(this.currentMonth).year(this.currentYear);
        this.startDate = month.clone().startOf("month").day(1);
        this.endDate = month.clone().endOf("month").day(7);// read for bubble behahvior https://momentjscom.readthedocs.io/en/latest/moment/02-get-set/06-day/
        this.buildMonth();
    }

    private buildMonth() {
        this.weeks = [];
        let isMonthOver = false, weekCount = 0;
        let amountOfWeeksInMonth = Math.round(moment(this.endDate).diff(this.startDate, 'days') / 7);

        let dateForWeek: moment.Moment = this.startDate.clone();

        for (let week = 0; week < amountOfWeeksInMonth; week++) {
            let datePickerDaysForWeek = this.buildWeek(dateForWeek.clone());
            let datePickerWeek = new DatePickerWeekViewModel(dateForWeek.week(), datePickerDaysForWeek);
            this.weeks.push(datePickerWeek);
            dateForWeek.add(1, 'w');
        }
    }

    private buildWeek(amoment: moment.Moment): DatePickerDayViewModel[] {
        let result: DatePickerDayViewModel[] = [];
        let markedMoments = new Array<moment.Moment>();
        if (this.markedDays)
            markedMoments = this.markedDays.map(mD => moment(mD));
        for (let i = 0; i < 7; i++) {
            result.push(new DatePickerDayViewModel(amoment, this.currentMonth, this.innerValue, this.valueChange, markedMoments));
            amoment = amoment.clone();
            amoment.add(1, "d");
        }
        return result;
    }

    today() {
        this.select(new Date(Date.now()));
    }

    public setYear(pickedYear: number) {
        this.currentYear = pickedYear;
        this.refreshStartEndDate();
        this.displayModus = DisplayModus.Days;
    }


    public setModusYear() {
        if (this.modusYear) {
            this.displayModus = DisplayModus.Years;
            this.fillYearAuswahlArray();
        }
    }

    public fillYearAuswahlArray() {
        this.yearAuswahl = new Array<Array<number>>(new Array<number>());
        let startYear = this.yearInCenterView - 12;
        for (let z = 0; z < 5; z++) {
            this.yearAuswahl.push([]);
            for (let i = 0; i < 5; i++) {
                this.yearAuswahl[z].push(startYear);
                startYear++;
            }
        }
    }

    public get DISPLAY_MODUS_DAYS(): DisplayModus {
        return DisplayModus.Days
    }

    public get DISPLAY_MODUS_YEARS(): DisplayModus {
        return DisplayModus.Years
    }

    public getStartDate(): Date {
        return this.startDate.toDate();
    }

    public getEndDate(): Date {
        return this.endDate.toDate();
    }
}

enum ValueType { Undefined, DateString, DateObject }

export class DatePickerWeekViewModel {
    constructor(
        public weekNumber: number,
        public days: DatePickerDayViewModel[] = []
    ) { }
}

export class DatePickerDayViewModel {
    constructor(
        public currentMoment: moment.Moment,
        currentMonth: number,
        valueMoment: moment.Moment,
        valueChange: EventEmitter<string | Date>,
        markedDays: moment.Moment[]
    ) {
        this.isCurrentMonth = currentMoment.month() == currentMonth;
        this.isToday = currentMoment.isSame(new Date(), "day");
        this.isSelected = currentMoment.isSame(valueMoment, "day");
        this.isMarked = markedDays.some(mD => mD.startOf('day').isSame(currentMoment));
        valueChange.subscribe((newValue: string | Date) => {
            let newValueMoment = moment(newValue);
            this.isSelected = currentMoment.isSame(newValueMoment, "day");
        });
    }
    public isCurrentMonth: boolean;
    public isToday: boolean;
    public isSelected: boolean;
    public isMarked: boolean;
    public get currentDate(): Date {
        return this.currentMoment.toDate();
    }

    public get cssClass(): string {
        let result = "";
        if (!this.isCurrentMonth) result += " second-color";
        if (this.isToday) result += " bg-today ";
        if (this.isSelected) result += " bg-selected";
        if (this.isMarked) result += " bg-marked";
        return result;
    }


}

export enum DisplayModus {
    Years = 0,
    Days = 1
}
