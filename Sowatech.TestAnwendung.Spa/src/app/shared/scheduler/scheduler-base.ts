import 'moment/locale/de';

import { ChangeDetectorRef, EventEmitter } from '@angular/core';
import { LocaleService } from 'angular-l10n';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../utilities/logger.service';
import {
    IScheduledItem,
    MonthItem,
    ScheduledItemClickEvent,
    ScheduledItemDragDropEvent,
    ScheduledItemModel,
    SchedulerDataTransferItem,
    TimeLineSlot,
    TimeLineSlotCell,
    TimelineSlotDataItem,
    TimeSlotCellClickEvent,
} from './scheduler-shared';
import { TDestRowType } from './types/dest-row.type';
import { TScheduledItemsDateFormat } from './types/scheduled-items-date-format.type';
import { TSchedulerVariantType } from './types/scheduler-variant.type';

export const CELL_PADDING: number = 5;
export const TABLE_MARGIN_VERTICAL: number = 6;
export const TABLE_BORDER: number = 1;

const DATATRANSFER_SCHEDULERITEM = "SchedulerItem";

const CLASS = "SchedulerTimelineBase";

export abstract class SchedulerTimelineBase {
  constructor(
    public locale: LocaleService,
    protected logger: LoggerService,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
  }

  protected subscriptions = new Array<Subscription>();
  protected onInitCompleted = false;
  protected ngOnInit() {
    this.onInitCompleted = true;
    this.recalcTimeLine();
    this.refresh();
  }

  protected ngOnDestroy() {
    for (var s of this.subscriptions) {
      s.unsubscribe();
    }
  }

  refresh() {
    if (this.onInitCompleted) {
      this.refreshTimelineSlots();
      this.recalcWidthsAndHeights();
      this.refreshItems();
      //this.changeDetectorRef.detectChanges();//aktivieren falls changeDetection = ChangeDetectionStrategy.OnPush
    }
  }

  public tableWidth: number = null;//1000;
  protected tableCustomColumnsWidth: number = 0;//width for e.g. resource-columns etc. added by inherited components. this width will be substracted from the available space for timeslots

  public headerHeight: number = 32;
  private numOfHeaderRows: number = 1;
  public headerRowHeight: number;

  public showNameOfMonth: boolean = false;
  public showNameOfDay: boolean = false;

  public cellPadding: number;
  public small: boolean = true;
  public rowHeight: number = 32;

  protected setVariant(value: TSchedulerVariantType) {
    this.variant = value;
    this.recalcTimeLine();
    this.refresh();
  }
  protected variant: TSchedulerVariantType = "isoWeekMonth";

  public setTimeLineDate(value: Date | string) {
    let date = typeof (value) == 'string' ? new Date(value) : value;
    this.recalcTimeLine(date);
    this.refresh();
  }
  protected timeLineStartMoment: moment.Moment;
  protected timeLineEndMoment: moment.Moment;

  public get timeLineStart(): Date {
    return this.timeLineStartMoment ? this.timeLineStartMoment.toDate() : null;
  }

  public get timeLineEnd(): Date {
    return this.timeLineEndMoment ? this.timeLineEndMoment.toDate() : null;
  }

  public monthItems = new Array<MonthItem>(); //table header band for the currentyl shown month(s). depending on variant and first/last weekday of month 1-3 "monthItems" are visible"

  protected setSlotWidth(value: number) {
    this.timeLineSlotWidth = value > 0 ? value - (CELL_PADDING * 2) - TABLE_BORDER : null;
    this.recalcTimeLine();
  }
  public timeLineSlotWidth: number; //inner width in pixels
  public get timeLineSlotOuterWidth(): number //outer width (inkl padding & border) in pixels
  {
    return this.timeLineSlotWidth > 0 ? this.timeLineSlotWidth + (CELL_PADDING * 2) + TABLE_BORDER : null;
  }

  public timeLineSlotNumber: number; //readonly. calculated num of slots
  public timeLineSlots: Array<TimeLineSlot> = []; //the shown table columns, normally representing 1 day of time

  //-- recalc dimensions

  private recalcTimeLine(date?: Date | string) {
    if (!this.onInitCompleted) return;

    if (!date) date = this.timeLineStartMoment ? this.timeLineStartMoment.toDate() : new Date();
    let startMoment = moment(date);
    let startOfMonthMoment = moment(date).startOf('month');
    let endOfMonthMoment = startOfMonthMoment.clone().endOf("month");
    switch (this.variant) {
      case "calendarMonth":
        this.timeLineStartMoment = startOfMonthMoment.clone();
        this.timeLineEndMoment = endOfMonthMoment.clone();
        break;
      case "isoWeekMonth":
        this.timeLineStartMoment = startOfMonthMoment.clone().startOf('isoWeek');//isoWeek starts on monday
        this.timeLineEndMoment = endOfMonthMoment.clone().endOf('isoWeek');
        break;
      case "weekMonth":
        this.timeLineStartMoment = startOfMonthMoment.clone().startOf('week');//week starts on sunday
        this.timeLineEndMoment = endOfMonthMoment.clone().endOf('week');
        break;
      case "isoWeek":
        this.timeLineStartMoment = startMoment.clone().startOf('isoWeek');//isoWeek starts on monday
        this.timeLineEndMoment = this.timeLineStartMoment.clone().endOf('isoWeek');
        break;
      default: throw ("Unhandled variant=" + this.variant);
    }

    this.recalcMonthItems(startOfMonthMoment, endOfMonthMoment);
    this.recalcWidthsAndHeights();
  }

  private recalcMonthItems(startOfMonthMoment: moment.Moment, endOfMonthMoment: moment.Moment) {
    this.monthItems = [];
    let numOfDaysInLastMonth = startOfMonthMoment.diff(this.timeLineStartMoment, "days");
    if (numOfDaysInLastMonth > 0) {
      let lastMonthItem = new MonthItem(this.timeLineStartMoment, numOfDaysInLastMonth);
      this.monthItems.push(lastMonthItem);
    }

    let startOfMonthInTimeline = this.timeLineStartMoment.diff(startOfMonthMoment) > 0 ? this.timeLineStartMoment : startOfMonthMoment;
    let endOfMonthInTimeline = this.timeLineEndMoment.diff(endOfMonthMoment) > 0 ? endOfMonthMoment : this.timeLineEndMoment;
    let numOfDaysInMonth = endOfMonthInTimeline.diff(startOfMonthInTimeline, "days") + 1;
    let currentMonthItem = new MonthItem(startOfMonthMoment, numOfDaysInMonth);
    this.monthItems.push(currentMonthItem);

    let numOfDaysInNextMonth = this.timeLineEndMoment.diff(endOfMonthMoment, "days");
    if (numOfDaysInNextMonth > 0) {
      let nextMonthItem = new MonthItem(this.timeLineEndMoment, numOfDaysInNextMonth);
      this.monthItems.push(nextMonthItem);
    }
  }

  protected recalcWidthsAndHeights() {
    this.cellPadding = CELL_PADDING;

    this.numOfHeaderRows = 1;
    if (this.showNameOfMonth) this.numOfHeaderRows++;
    if (this.showNameOfDay) this.numOfHeaderRows++;
    let rowBorder = 1;
    this.headerRowHeight = this.headerHeight / this.numOfHeaderRows;// - (this.numOfHeaderRows * rowBorder);

    let timeLineSlotsTotalWidth = this.timeLineSlotOuterWidth > 0 ? this.timeLineSlotOuterWidth * this.timeLineSlotNumber : null;

    if (timeLineSlotsTotalWidth > 0) {
      this.tableWidth = timeLineSlotsTotalWidth + this.tableCustomColumnsWidth + TABLE_BORDER * 2;
      //this.logger.debug(CLASS + ".recalcWidthsAndHeights: slotnumber=" + this.timeLineSlotNumber + " tableWidth=" + this.tableWidth);
    }
    else {
      this.tableWidth = null;
    }
  }

  //--- TimeLineSlots --

  public setSlotDataItems(values: Array<TimelineSlotDataItem>) {
    this._slotDataItems = values;
    this.refresh();
  }
  private _slotDataItems = new Array<TimelineSlotDataItem>();

  //public timelineSlotDuration: number = 1;//TODO
  //public timelineSlotDurationUnit: string = "days";//TODO

  public timelineSlotsRefreshed = new EventEmitter<void>();
  public refreshTimelineSlots() {
    if (!this.onInitCompleted) return;
    let numOfDays = this.timeLineEndMoment.diff(this.timeLineStartMoment, "days") + 1;
    this.timeLineSlots = [];
    for (let i = 1; i <= numOfDays; i++) {
      let slotMoment = this.timeLineStartMoment.clone().add(i - 1, "day");
      let slot = new TimeLineSlot(slotMoment);
      slot.tryFillCellData(this._slotDataItems, this.variant, (arg) => this.getSlotCellLineId(arg));
      this.timeLineSlots.push(slot);
    }
    this.timeLineSlotNumber = numOfDays;
    this.timelineSlotsRefreshed.emit();
    this.logger.debug(CLASS + ".refreshTimelineSlots: slotnumber=" + this.timeLineSlotNumber);
  }

  public cellClick = new EventEmitter<TimeSlotCellClickEvent>();
  public onCellClick(event: MouseEvent, lineId: any, slot: TimeLineSlot) {
    this.logger.log(CLASS + ".onCellClick");
    event.stopPropagation();
    let e = new TimeSlotCellClickEvent();
    e.lineId = lineId;
    e.date = this.getDateOfCell(slot, lineId);
    let cell = slot.getCell(lineId);
    e.dataItems = cell ? cell.dataItems : [];
    this.cellClick.next(e);
  }

  protected findTimeLineSlot(arg: Date | string): TimeLineSlot {
    let date: Date = typeof (arg) == "string" ? moment(arg).toDate() : arg;
    return this.timeLineSlots.find(s => s.isSlotForDate(date, this.variant));
  }

  protected findTimeLineSlots(argFrom: Date | string, argTo: Date | string): TimeLineSlot[] {
    let dateFrom: Date = typeof (argFrom) == "string" ? moment(argFrom).toDate() : argFrom;
    let dateTo: Date = typeof (argTo) == "string" ? moment(argTo).toDate() : argTo;

    let result = new Array<TimeLineSlot>();
    return this.timeLineSlots.filter(s => s.isSlotBetweenDates(dateFrom, dateTo, this.variant));
  }

  protected findTimeLineSlotCell(date: Date | string, lineId: string | number): TimeLineSlotCell {
    let cell: TimeLineSlotCell = null;
    let slot = this.findTimeLineSlot(date);
    if (slot) {
      cell = slot.getOrCreateCell(lineId);
    }
    else {
      let dateString = typeof (date) == "string" ? <string>date : (<Date>date).toDateString();
      this.logger.warn(CLASS + ".findTimeLineSlotCell() No slot for " + dateString);
    }
    return cell;
  }

  //--- Cell / Line Methods  --------------------------
  protected getDateOfCell(slot: TimeLineSlot, lineId: string | number): Date {
    //override, if more precise date of cell possible (e.g. scheduler with time-cell)
    return slot.date;
  }

  public cellClass(slot: TimeLineSlot, lineId: string | number): string {
    let clickableClass = this.itemClick.observers.length > 0 ? " ui-clickable" : "";
    return slot.cellClass(lineId) + clickableClass;
  }

  protected abstract getSlotCellLineId(timelineSlotDataItem: TimelineSlotDataItem): string | number;
  protected abstract getSlotCellLineId(scheduledItem: IScheduledItem): string | number;

  //--- ScheduledItems --------------------------

  public scheduledItemsDateFormat: TScheduledItemsDateFormat = "dateTime";
  protected formatScheduledItemsDate(src: Date | string): Date | string {
    let result = src;
    if (src) {
      switch (this.scheduledItemsDateFormat) {
        case "dateTime":
          if (typeof (src) == "string") result = moment(src).toDate();
          break;
        case "date":
          let isoDateLength = 10;
          if (typeof (src) != "string" || (<string>src).length > isoDateLength) result = moment(src).format("YYYY-MM-DD");
          break;
        default:
          throw ("formatScheduledItemsDate not implemented for TScheduledItemsDateFormat=" + this.scheduledItemsDateFormat);
      }
    }
    return result;
  }

  public scheduledItemsAsAppointments: boolean = false;//true: scheduledItems werden nicht als overlay angezeigt sondern nur die startpunkte innerhalb der zellen
  public setScheduledItems(values: Array<IScheduledItem>) {
    this.items = [];
    this.scheduledDataItems = values ? values : [];
    this.assertFixedSlotWidth();
    this.refresh();
  }
  protected scheduledDataItems: Array<IScheduledItem>;
  public items: Array<ScheduledItemModel> = [];

  private assertFixedSlotWidth() {
    if (!this.scheduledItemsAsAppointments && this.scheduledDataItems.length > 0 && !this.tableWidth) {
      this.logger.warn(CLASS + ".assertFixedSlotWidth(): positioning of scheduledItems need a fixed slotWidth. SlotWidth=30 will be set as default");
      this.setSlotWidth(30);
    }
  }

  public refreshItems() {
    if (!this.onInitCompleted) return;
    if (this.scheduledDataItems) {
      if (this.scheduledItemsAsAppointments) {
        this.refreshCellAppointments();
      }
      else {
        this.refreshScheduledItems();
      }
    }
  }

  //override if necessary
  protected refreshScheduledItems() {
    this.items = [];
    for (let value of this.scheduledDataItems) {
      let item = this.createScheduledItemModel(value);
      if (item) this.items.push(item);
    }
  }

  protected abstract createScheduledItemModel(value: IScheduledItem): ScheduledItemModel;

  public itemClick = new EventEmitter<ScheduledItemClickEvent>();
  public onItemClick(item: ScheduledItemModel) {
    event.stopPropagation();
    this.logger.log(CLASS + ".onItemClick");
    let e = new ScheduledItemClickEvent();
    e.resourceId = item.resourceId;
    e.start = item.start;
    e.end = item.end;
    e.text = item.text;
    e.ident = item.ident;
    this.setItemActive(item);
    this.itemClick.next(e);
  }

  public setItemActive(itemIdent: any);
  public setItemActive(item: ScheduledItemModel);
  public setItemActive(arg: any) {
    let item: ScheduledItemModel;
    item = typeof (arg) == "object" ? arg : this.items.find(it => it.ident == arg);
    this.clearItemActive();
    if (item && item.class && !item.class.includes("active")) item.class += " active";
  }

  public removeItemActive(item: ScheduledItemModel) {
    item.class = item.class.replace("active", "");
  }

  public clearItemActive() {
    for (let item of this.items) {
      this.removeItemActive(item);
    }
  }

  //--- ScheduledItems  drag drop ------------

  public itemDrop = new EventEmitter<ScheduledItemDragDropEvent>();
  public itemDragStart = new EventEmitter<ScheduledItemDragDropEvent>();
  public itemDragOver = new EventEmitter<ScheduledItemDragDropEvent>();
  public allowDragItems: boolean;

  public onItemDragStart(event: DragEvent, item: ScheduledItemModel) {
    if (!this.allowDragItems) return;
    this.setItemActive(item);
    this.logger.log(CLASS + ".onItemDragStart");
    let dragItem = new SchedulerDataTransferItem();
    dragItem.item = item;
    dragItem.offsetX = event.offsetX;
    dragItem.offsetY = event.offsetY;
    let leftClippedSlots = Math.ceil(this.timeLineStartMoment.diff(item.start, "days"));
    let clippedOffset = leftClippedSlots > 0 ? leftClippedSlots : 0;
    dragItem.slotOffset = Math.floor(event.offsetX / this.timeLineSlotOuterWidth) + clippedOffset;
    event.dataTransfer.setData(DATATRANSFER_SCHEDULERITEM, dragItem.toJson());
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    this.itemDragStart.emit(new ScheduledItemDragDropEvent(event,item));

    this.dataTransferDragItemDummy = dragItem;
  }

  private dataTransferDragItemDummy: SchedulerDataTransferItem;//workaround notwendig weil in html5 nur bei dragstart und bei drop zugriff auf dataTransfer.getData besteht

  public onItemDragOver(event: DragEvent) {
    let nodeName = (<Element>event.target).nodeName;
    if (nodeName == "TD" || nodeName == "TH") {
      event.preventDefault();
      if (this.itemDragOver.observers.length > 0) {
        let dragItem = this.dataTransferDragItemDummy;
        let eventData = this.createScheduledItemDragDropEventData(event, dragItem);
        this.itemDragOver.emit(eventData);
      }
    }
  }

  public onItemDrop(event: DragEvent) {
    this.logger.log(CLASS + ".onItemDrop");
    let dragItem = SchedulerDataTransferItem.fromJson(event.dataTransfer.getData(DATATRANSFER_SCHEDULERITEM));
    let eventData = this.createScheduledItemDragDropEventData(event, dragItem);
    this.itemDrop.emit(eventData);
    this.dataTransferDragItemDummy = null;
  }

  private createScheduledItemDragDropEventData(event: DragEvent, dragItem: SchedulerDataTransferItem): ScheduledItemDragDropEvent {
    let elementAttr = this.getDropTargetAttr(<Element>event.target);

    if (event.type == "dragover") {
      event.dataTransfer.dropEffect = elementAttr.rowType == "body" ? "move" : "none";
    }

    let slotOffset = dragItem ? dragItem.slotOffset : 0;
    let destStart = elementAttr.slot ? moment(elementAttr.slot.date).add(-slotOffset, "days").toDate() : null;

    let secondsTillEnd = dragItem ? dragItem.item.diffSeconds : 0;
    let destEnd = destStart ? moment(destStart).clone().add(secondsTillEnd, "seconds").toDate() : null;

    let eventData = new ScheduledItemDragDropEvent(
      event,
      dragItem ? dragItem.item:null,
      elementAttr.rowType,
      elementAttr.lineId,
      this.formatScheduledItemsDate(destStart),
      this.formatScheduledItemsDate(destEnd));

    return eventData;
  }

  private getDropTargetAttr(elem: Element): { slot: TimeLineSlot, lineId: number, rowType: TDestRowType } {
    //--slot
    let slotIndexAttr = elem.attributes.getNamedItem("data-slot-index");
    let slotIndex: number = slotIndexAttr ? +slotIndexAttr.value : null;
    let slot = slotIndex >= 0 ? this.timeLineSlots[slotIndex] : null;

    //--lineId
    let row = elem.parentElement;
    let lineIdAttr = row.attributes.getNamedItem("data-line-id");
    let lineId: number = lineIdAttr ? +lineIdAttr.value : null;

    let rowType: TDestRowType = null;
    if (row && row.parentElement && row.parentElement.nodeName == "TBODY") rowType = "body";
    if (row && row.className.includes("header-month")) rowType = "header-month";
    if (row && row.className.includes("header-text")) rowType = "header-text";
    if (row && row.className.includes("header-name-of-day")) rowType = "header-name-of-day";

    return { slot: slot, lineId: lineId, rowType: rowType };
  }

  //--- CellAppointments --------------------

  protected refreshCellAppointments() {
    this.items = [];
    for (let scheduledItem of this.scheduledDataItems) {
      let slot = this.findTimeLineSlot(scheduledItem.start);
      if (slot) {
        let lineId = this.getSlotCellLineId(scheduledItem);
        let cell = this.findTimeLineSlotCell(scheduledItem.start, lineId);
        if (cell) {
          cell.addAppointment(scheduledItem);
        }
        else {
          this.logger.warn(CLASS + ".refreshCellAppointments() No cell for lineId=" + lineId);
        }
      }
    }
  }

}
