import 'moment/locale/de';

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { Language, LocaleService, TranslationService } from 'angular-l10n';
import * as moment from 'moment';

import { LoadingIndicatorComponent } from '../swt-controls/swt-loading-indicator.component';
import { LoggerService } from '../utilities/logger.service';
import { CELL_PADDING, SchedulerTimelineBase, TABLE_BORDER } from './scheduler-base';
import {
    IScheduledItem,
    ScheduledItemClickEvent,
    ScheduledItemModel,
    TimeLineSlot,
    TimelineSlotDataItem,
    TimeSlotCellClickEvent,
} from './scheduler-shared';
import { TSchedulerVariantType } from './types/scheduler-variant.type';

const TIMELINE_SECONDS_PER_SLOT = 60 * 60 * 24;
const ITEM_MARGIN_VERTICAL: number = 5;
const ITEM_MARGIN_HORIZONTAL = 0;

@Component({
  selector: 'scheduler-calendar',
  moduleId: module.id,
  templateUrl: "./scheduler-calendar.component.html",
  styleUrls: ['./scheduler.scss'],
  changeDetection: ChangeDetectionStrategy.Default //https://angular-2-training-book.rangle.io/handout/change-detection/change_detection_strategy_onpush.html
})

export class SchedulerCalendarComponent extends SchedulerTimelineBase implements OnInit, OnDestroy {
  constructor(
    locale: LocaleService,
    translation: TranslationService,
    logger: LoggerService,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(locale,  logger, changeDetectorRef);
  }

  @Language() lang: string;
  ngOnInit() {
    this.createTimeIntervals();
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  @ViewChild('loadingIndicator') loadingIndicator: LoadingIndicatorComponent;
  @Input() headerHeight: number;
  @Input() small: boolean;
  @Input() rowHeight: number;
  @Input() showNameOfMonth: boolean;
  @Input() showNameOfDay: boolean;
  @Input('variant') set _variant(value: TSchedulerVariantType) {
    super.setVariant(value);
  }
  @Input('date') set _timeLineDate(value: Date | string) {
    super.setTimeLineDate(value);
  }

  @Input('slotWidth') set _slotWidth(value: number) {
    super.setSlotWidth(value);
  }
  @Input('slotItems') set _slotItems(values: Array<TimelineSlotDataItem>) {
    super.setSlotDataItems(values);
  }
  @Output() cellClick: EventEmitter<TimeSlotCellClickEvent>;
  @Output() itemClick: EventEmitter<ScheduledItemClickEvent>;
  @Output() timelineSlotsRefreshed:EventEmitter<void>;

  @Input('scheduledItems') set _scheduledItems(values: Array<IScheduledItem>) {
    super.setScheduledItems(values);
  }

  @Input('scheduledItemsAsAppointments') scheduledItemsAsAppointments: boolean = true;


  protected recalcWidthsAndHeights() {
    this.timeIntervalColWidth = this.timeIntervalColOuterWidth - (CELL_PADDING * 2) - TABLE_BORDER;
    this.tableCustomColumnsWidth = this.timeIntervalColOuterWidth;
    super.recalcWidthsAndHeights();
  }

  //------------------ ScheduledItems

  protected createScheduledItemModel(value: IScheduledItem): ScheduledItemModel {
    let item: ScheduledItemModel = null;
    //  let resourceItem = this.resourceDatasource.getDataItem(value.resourceId);
    //  let rowIndexOfResourceId = this.resourceDatasource.data.indexOf(resourceItem);
    //  if (rowIndexOfResourceId >= 0) {
    //    item = new ScheduledItemModel();
    //    item.resourceId = value.resourceId;
    //    item.start = value.start;
    //    item.end = value.end;
    //    item.height = this.rowHeight - ITEM_MARGIN_VERTICAL * 2;
    //    item.left = this.date2LeftPx(value.start);
    //    item.width = this.seconds2Px(moment(value.end).diff(moment(value.start), "seconds"));
    //    item.top = this.headerHeight + this.rowHeight * rowIndexOfResourceId + ITEM_MARGIN_VERTICAL + TABLE_MARGIN_VERTICAL + TABLE_BORDER;
    //  }
    return item;
  }

  //---

  @Input() showTimeIntervalColumn: boolean = true;
  @Input('timeIntervalColWidth') set _timeIntervalColOuterWidth(value: number) {
    this.timeIntervalColOuterWidth = value;
  }
  private timeIntervalColOuterWidth: number = 60; //incl padding & border
  public timeIntervalColWidth: number; //readonly. set in recalc(). excl padding & border

  @Input('timeIntervalMinutes') set _timeIntervalMinutes(value: number) {
    this.timeIntervalMinutes = value;
    this.createTimeIntervals();
  }
  private timeIntervalMinutes: number = 30;

  @Input('timeRangeStartHour') set _timeRangeStartHour(value: number) {
    this.timeRangeStartHour = value;
    this.createTimeIntervals();
  }
  private timeRangeStartHour: number = 7;

  @Input('timeRangeEndHour') set _timeRangeEndHour(value: number) {
    this.timeRangeEndHour = value;
    this.createTimeIntervals();
  }
  private timeRangeEndHour: number = 19;

  public timeIntervals = new Array<TimeInterval>();

  private createTimeIntervals() {
    //if (!this.onInitCompleted) return;

    this.timeIntervals = [];
    let currentMinute = this.timeRangeStartHour * 60;
    let endMinute = this.timeRangeEndHour * 60;
    while (currentMinute <= endMinute) {
      let interval = new TimeInterval(currentMinute);
      this.timeIntervals.push(interval);
      currentMinute += this.timeIntervalMinutes;
    }
  }

  private findTimeInterval(date: Date|string): TimeInterval {
    if (this.timeIntervals.length < 1) return null;
    let timeValue = this.dateTime2TimeValue(date);
    let nextIndex = this.timeIntervals.findIndex(t => t.ident > timeValue);
    return nextIndex > 0 ? this.timeIntervals[nextIndex - 1] : this.timeIntervals[this.timeIntervals.length - 1]
  }
  protected getSlotCellLineId(scheduledItem: IScheduledItem): any;
  protected getSlotCellLineId(timelineSlotDataItem: TimelineSlotDataItem): any;
  protected getSlotCellLineId(arg1: Object): any {
    
    let timeInterval: TimeInterval;
    if (arg1["start"]) {
      let scheduledItem: IScheduledItem = <IScheduledItem>arg1;
      timeInterval = this.findTimeInterval(scheduledItem.start);
    }
    else {
      let timelineSlotDataItem: TimelineSlotDataItem = <TimelineSlotDataItem>arg1;
      timeInterval = this.findTimeInterval(timelineSlotDataItem.date);
    }
    return timeInterval ? timeInterval.ident : null;
  }

  protected getDateOfCell(slot: TimeLineSlot, lineId: any): Date {
    //super.getDateOfCell(slot, lineId);
    return this.timeValue2DateTime(lineId, slot.date);
  }
  
  //Hilfsfunktion (auch für extern): Numerischer Wert für die Uhrzeit eines Datums, so wie im Scheduler verwendet (= entspricht der Minute des Tages)
  public dateTime2TimeValue(date: Date | string): number {
    let d = typeof(date) == "string" ? new Date(<string>date):date;
    let minuteOfDay = d.getHours() * 60 + d.getMinutes();
    //let minuteOfDay = moment(date).diff(moment(date).startOf("day"), "minutes"); //liefert am tag der Zeitumstellung eine Stunde weniger als erwartet 
    return minuteOfDay;
  }

  //Hilfsfunktion (für extern): rechnet den Numerischen Wert einer Uhrzeit in ein DateTime. Erfordert dazu das Datum auf den die Uhrzeit angewendet werden soll
  public timeValue2DateTime(timeValue: number, dateOfDay: Date): Date {
    let hourOfDay = Math.floor(timeValue / 60);
    let minuteOfLastHour = timeValue % 60;
    let dateTime = new Date(dateOfDay.getFullYear(), dateOfDay.getMonth(), dateOfDay.getDate(), hourOfDay, minuteOfLastHour);
    //let dateTime = moment(dateOfDay).startOf("day").add(timeValue, "minutes").toDate();
    return dateTime;
  }

  //Hilfsfunktion für extern: Zeitskala des calendar auf ein übergebenes Datum abbilden. Ale letztes wird DAS ENDE des letzten Intervals geliefert.
  public getTimeIntervalsForDate(date: Date): Date[] {
    let intervalDates = Array<Date>();
    let intervalStartDate
    for (let timeInterval of this.timeIntervals) {
      intervalStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeInterval.hour, timeInterval.hourMinute);
      intervalDates.push(intervalStartDate);
    }
    let closingDate = moment(intervalStartDate).add(this.timeIntervalMinutes, "m").toDate();//ende des letzten intervals
    intervalDates.push(closingDate);
    return intervalDates;
  }

}

export class TimeInterval {
  constructor(minute: number) {
    this.ident = minute;
    this.hour = Math.floor(minute / 60);
    this.hourMinute = minute % 60;
    this.text = this.hour.toString() + ":" + (this.hourMinute < 10 ? "0" : "") + this.hourMinute.toString();
  }

  hour: number;
  hourMinute: number;
  ident: number;
  text: string;
}

