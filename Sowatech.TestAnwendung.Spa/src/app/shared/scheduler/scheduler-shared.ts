import * as moment from 'moment';
import 'moment/locale/de';
import { TSchedulerVariantType } from './types/scheduler-variant.type';
import { TDestRowType } from './types/dest-row.type';

//enum DayOfWeek { Sun = 0, Mon = 1, Tue = 2, Wed = 3, Thu = 4, Fri = 5, Sat = 6 };

export class MonthItem {
  constructor(monthMoment: moment.Moment, numOfSlots?: number) {
    let monthNameFormat = "MMM YYYY";
    this.name = monthMoment.format(monthNameFormat);
    this.class = "month-" + (monthMoment.month() + 1).toString();
    this.numOfSlots = numOfSlots ? numOfSlots : monthMoment.daysInMonth();
  }
  name: string;
  class: string;
  numOfSlots: number;
}

export class TimeLineSlot {
  constructor(slotMoment: moment.Moment) {
    this.slotMoment = slotMoment;
    this.headerText = slotMoment.format("DD");
    this.nameOfDay = slotMoment.format("dd");
    this.slotDateTimeIso = slotMoment.toISOString();
    this.class = "day-of-week-" + slotMoment.toDate().getDay();
    this.class += " month-" + (slotMoment.month() + 1).toString();
    this.cells = {};
  }
  private slotMoment: moment.Moment;
  public get date(): Date {
    return this.slotMoment.toDate();
  }
  public headerText: string;
  public nameOfDay: string;
  public class: string;
  public slotDateTimeIso: string;

  public cells: object; //dictionary of TimeLineSlotCell mit Zugriff via resourceId, z.B. cells[resourceId].text oder über getCell(resourceId)
  public getCell(lineId: any | "HEADER" | "ALL"): TimeLineSlotCell {
    return this.cells[lineId];
  }

  public getOrCreateCell(lineId: any | "HEADER" | "ALL"): TimeLineSlotCell {

    let cell = this.getCell(lineId);
    if (!cell) {
      cell = new TimeLineSlotCell(lineId, null);
      this.cells[lineId] = cell;
    }
    return cell;
  }

  public isSlotForDate(date: Date | string, timeLineVariant: TSchedulerVariantType): boolean {
    let result = false;
    let nextSlotMoment: moment.Moment;
    switch (timeLineVariant) {
      default:
        //all day-based timelines
        nextSlotMoment = this.slotMoment.clone().endOf("day");
        break;
    }
    result = moment(date).isBetween(this.slotMoment, nextSlotMoment, null, "[]");//[] = inclusive
    return result;
  }

  public isSlotBetweenDates(dateFrom: Date | string, dateTo: Date | string, timeLineVariant: TSchedulerVariantType): boolean {
    let result = false;
    let nextSlotMoment: moment.Moment;

    switch (timeLineVariant) {
      default:
        //all day-based timelines
        result = this.slotMoment.isBetween(dateFrom, dateTo, null, "[]");//[] = inclusive
        break;
    }
    return result;
  }

  public tryFillCellData(dataItems: Array<TimelineSlotDataItem>, timeLineVariant: TSchedulerVariantType, getSlotCellLineId: (timelineSlotDataItem: TimelineSlotDataItem) => any) {
    this.cells = {};
    if (!dataItems) return;
    for (let dataItem of dataItems) {
      if (this.isSlotForDate(dataItem.date, timeLineVariant)) {
        let lineId = getSlotCellLineId(dataItem);
        let timeLineSlotCell = this.getCell(dataItem.resourceId);
        if (!timeLineSlotCell) {
          timeLineSlotCell = new TimeLineSlotCell(lineId, dataItem);
        }
        else {
          timeLineSlotCell.add(dataItem);
        }
        //let lineId = dataItem.resourceId ? dataItem.resourceId : "HEADER";
        this.cells[lineId] = timeLineSlotCell;
      }
    }
  }

  public headerCellTitle(): string {
    let result = this.cellTitle();
    let headerCell = this.cells['HEADER'];
    if (headerCell && headerCell.title) {
      result += headerCell.title + " ";
    }
    return result;
  }

  public cellTitle(lineId: any = null): string {
    let result = "";
    if (lineId) {
      let lineCell = this.getCell(lineId);
      if (lineCell && lineCell.title) {
        result += lineCell.title + " ";
      }
    }
    let allCell = this.cells['ALL'];
    if (allCell && allCell.title) {
      result += allCell.title + " ";
    }
    return result;
  }

  public headerCellClass(): string {
    let result = this.cellClass();
    let headerCell = this.cells['HEADER'];
    if (headerCell && headerCell.class) {
      result += headerCell.class + " ";
    }
    return result;
  }

  public cellClass(lineId: any = null): string {
    let result = this.class + " ";

    let allCell = this.cells['ALL'];
    if (allCell && allCell.class) {
      result += allCell.class + " ";
    }

    if (lineId) {
      let lineCell = this.getCell(lineId);
      if (lineCell && lineCell.class) {
        result += lineCell.class + " ";
      }
    }
    return result;
  }
}

export class TimeLineSlotCell {
  constructor(lineId: any, dataItem: TimelineSlotDataItem = null) {
    if (dataItem) this.add(dataItem);
    this.lineId = lineId;
  }

  public title: string = "";
  public text: string = "";
  public class: string = "";
  public lineId: any;

  public add(dataItem: TimelineSlotDataItem) {
    if (dataItem.title) {
      if (this.title) this.title += " ";
      this.title += dataItem.title;
    }
    if (dataItem.text) {
      if (this.text) this.text += " ";
      this.text += dataItem.text;
    }
    if (dataItem.class) {
      if (this.class) this.class += " ";
      this.class += "custom-cell " + dataItem.class;
    }
    this.dataItems.push(dataItem);
  }

  public dataItems: Array<TimelineSlotDataItem> = [];
  public appointments?: Array<AppointmentModel> = [];

  public addAppointment(scheduledItem: IScheduledItem) {
    if (!this.appointments) this.appointments = [];
    this.appointments.push(new AppointmentModel(scheduledItem, this.lineId));
    this.appointments.sort((a, b) => a.start.valueOf() - b.start.valueOf());
  }
}

export class TimeSlotCellClickEvent {
  lineId: any;
  date: Date;
  dataItems: Array<TimelineSlotDataItem> = [];
}

//Input data
export class TimelineSlotDataItem {
  public resourceId?: any; // identifies the resource row, resourceId=null: =>Header Row
  public date: Date;  //identifies the time slot

  public class?: string; //css class will be added to class of timeslot cell
  public title?: string;//title will be added to title attribute of timeslot cell
  public text?: string;//text will be added to text content of timeslot cell
}

//---- item

export interface IScheduledItem {
  start: Date | string;
  end: Date | string;
  resourceId?: number;
  text?: string;
  title?: string;
  class?: string;
  ident?: string | number;//external ident for reference
}

export class ScheduledItemModel implements IScheduledItem {
  public resourceId: number;
  public left: number;
  public width: number;
  public height: number;
  public top: number;
  public start: Date | string;
  public end: Date | string;
  public text: string;
  public title: string;
  public class: string;
  public ident: string | number;
  public cellRowIndex: number;

  public get diffSeconds(): number {
    return moment(this.end).diff(this.start, "seconds");
  }

  public get diffDays(): number {
    return moment(this.end).diff(this.start, "days");
  }
}

export class ScheduledItemClickEvent {
  resourceId?: any;
  start: Date | string;
  end: Date | string;
  ident: any;
  text: string;
}

export class ScheduledItemDragDropEvent {

  constructor(
    public original: DragEvent,
    item: IScheduledItem,
    public destRowType: TDestRowType = null,
    public destResourceId?: any,
    public destStart?: Date | string,
    public destEnd?: Date | string
  ) {
    if (item) {
      this.ident = item.ident;
      this.srcResourceId = item.resourceId;
      this.srcStart = item.start;
      this.srcEnd = item.end;
    }
  }


  ident: any;
  text: string;

  srcResourceId?: any;
  srcStart: Date | string;
  srcEnd: Date | string;

}

export class SchedulerDataTransferItem {

  item: ScheduledItemModel;
  offsetX: number;
  offsetY: number;
  slotOffset: number;

  toJson(): string {
    return SchedulerDataTransferItem.toJson(this);
  }

  static toJson(item: SchedulerDataTransferItem): string {
    return JSON.stringify(item);
  }

  static fromJson(json: string): SchedulerDataTransferItem {
    try {
      let result: SchedulerDataTransferItem = json ? JSON.parse(json) : null;
      if (result && result.item) {
        Object.setPrototypeOf(result.item, ScheduledItemModel.prototype);//weist dem deserialisierten Object die Methoden/Properties der class ScheduledItemModel zu
      }
      return result;
    }
    catch (error) {
      console.warn(error);
      return null;
    }
  }
}
//--- AppointmentModel

export class AppointmentModel {
  constructor(scheduledItem: IScheduledItem, lineId: any) {
    this.start = new Date(<any>scheduledItem.start);
    this.end = scheduledItem.end ? new Date(<any>scheduledItem.end) : null;
    this.text = scheduledItem.text;
    this.lineId = lineId;
    this.class = scheduledItem.class;
    this.title = scheduledItem.title;
    this.ident = scheduledItem.ident;
    this.resourceId = scheduledItem.resourceId;
  }
  public lineId: any;
  public start: Date;
  public end: Date;
  public text: string;
  public class: string;
  public title: string;
  public ident: string | number;
  public resourceId?: number;
}
