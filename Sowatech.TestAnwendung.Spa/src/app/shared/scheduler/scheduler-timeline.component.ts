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
} from '@angular/core';
import { Language, LocaleService, TranslationService } from 'angular-l10n';
import * as moment from 'moment';

import { DatasourceComponent } from '../ds-datasource/ds-datasource.module';
import { LoggerService } from '../utilities/logger.service';
import { CELL_PADDING, SchedulerTimelineBase, TABLE_BORDER, TABLE_MARGIN_VERTICAL } from './scheduler-base';
import {
    IScheduledItem,
    ScheduledItemClickEvent,
    ScheduledItemDragDropEvent,
    ScheduledItemModel,
    TimelineSlotDataItem,
    TimeSlotCellClickEvent,
} from './scheduler-shared';
import { TScheduledItemsDateFormat } from './types/scheduled-items-date-format.type';
import { TSchedulerVariantType } from './types/scheduler-variant.type';

const TIMELINE_SECONDS_PER_SLOT = 60 * 60 * 24;
const ITEM_MARGIN_VERTICAL: number = 5;
const ITEM_MAX_HEIGHT: number = 40;

@Component({
  selector: 'scheduler-timeline',
  moduleId: module.id,
  templateUrl: "./scheduler-timeline.component.html",
  styleUrls: ['./scheduler.scss'],
  changeDetection: ChangeDetectionStrategy.Default //https://angular-2-training-book.rangle.io/handout/change-detection/change_detection_strategy_onpush.html
})

export class SchedulerTimelineComponent extends SchedulerTimelineBase implements OnInit, OnDestroy {
  constructor(
    locale: LocaleService,
    translation: TranslationService,
    logger: LoggerService,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(locale, logger, changeDetectorRef);
  }

  @Language() lang: string;
  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

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

  @Output() itemDrop = new EventEmitter<ScheduledItemDragDropEvent>();
  @Output() itemDragStart = new EventEmitter<ScheduledItemDragDropEvent>();
  @Output() itemDragOver = new EventEmitter<ScheduledItemDragDropEvent>();

  @Input('scheduledItems') set _scheduledItems(values: Array<IScheduledItem>) {
    super.setScheduledItems(values);
  }
  @Input() scheduledItemsDateFormat: TScheduledItemsDateFormat = "date";
  @Input() scheduledItemMarginHorizontal:number = 3;
  @Input() scheduledItemMarginLeft: number = 0;
  
  @Input() allowDragItems: boolean = true;
  @Input() showResourceColumn: boolean = true;
  @Input() resourceHeaderText: string;
  @Input('resourceColWidth') set setResourceColWidthTotal(value: number) {
    this.resourceColOuterWidth = value;
  }
  private resourceColOuterWidth: number = 100;//incl padding & border
  public resourceColWidth: number;//excl padding & border
  
  protected recalcWidthsAndHeights() {
    this.resourceColWidth = this.showResourceColumn ? this.resourceColOuterWidth - (CELL_PADDING * 2) - TABLE_BORDER:0;
    this.tableCustomColumnsWidth = this.showResourceColumn ? this.resourceColOuterWidth : 0;
    super.recalcWidthsAndHeights();
  }

  @Input('idfield') resourceIdField: string = "id";
  @Input() resourceNameField: string = "name";
  @Input('datasource') set setListDatasource(value: DatasourceComponent) {

    this.resourceDatasource = value;
    this.subscriptions.push(
      this.resourceDatasource.onAfterRefresh.subscribe(
        () => this.refresh()
      ),
    )
    this.refresh();
  }
  public resourceDatasource: DatasourceComponent;

  //--- ScheduledItems
  
  protected refreshScheduledItems() {
    this.cellRowInfos = this.getScheduledItemCellRowInfos();
    super.refreshScheduledItems();
  }

  private cellRowInfos: ScheduledItemCellRowInfo;
  private getScheduledItemCellRowInfos(): ScheduledItemCellRowInfo
  {
    let result = new ScheduledItemCellRowInfo();
    let resourceIds = new Set(this.scheduledDataItems.map(sditem => sditem.resourceId));
    for (let sitem of this.scheduledDataItems) {
      let resourceId = "" + sitem.resourceId;
      if (!result.lineNumOfCellRows[resourceId]) {
        result.lineNumOfCellRows[resourceId] = 0;
      }
      if (!result.cellNumOfRows[resourceId]) {
        result.cellNumOfRows[resourceId] = {}
      }

      let relatedSlots = this.timeLineSlots.filter(s => s.isSlotBetweenDates(sitem.start, sitem.end, this.variant));
      let relatedCellsMaxNumOfRows = 0;
      for (let slot of relatedSlots) {
        if (!result.cellNumOfRows[resourceId][slot.slotDateTimeIso]) {
          result.cellNumOfRows[resourceId][slot.slotDateTimeIso] = 1;
        }
        else {
          result.cellNumOfRows[resourceId][slot.slotDateTimeIso] += 1;
        }
        relatedCellsMaxNumOfRows = Math.max(relatedCellsMaxNumOfRows, result.cellNumOfRows[resourceId][slot.slotDateTimeIso]);
        result.lineNumOfCellRows[resourceId] = Math.max(result.lineNumOfCellRows[resourceId], relatedCellsMaxNumOfRows);
      }
      result.scheduledItemRowIndex[sitem.ident] = relatedCellsMaxNumOfRows-1;
    }
    
    return result;
  }

  protected createScheduledItemModel(value: IScheduledItem): ScheduledItemModel {
    let item: ScheduledItemModel = null;
    let resourceItem = this.resourceDatasource.getDataItem(value.resourceId);
    let rowIndexOfResourceId = this.resourceDatasource.data.indexOf(resourceItem);
    if (rowIndexOfResourceId >= 0) {
      let timeLineStart = this.timeLineStartMoment.toDate();
      let timeLineEnd = this.timeLineEndMoment.toDate();
      
      if (value.start <= timeLineEnd && value.end >= timeLineStart) {
        item = new ScheduledItemModel();
        item.resourceId = value.resourceId;
        item.start = this.formatScheduledItemsDate(value.start);
        item.end = this.formatScheduledItemsDate(value.end);
        item.class = value.class ? value.class : "bg-primary text-center";
        item.text = value.text;
        item.title = value.title ? value.title : null;
        item.ident = value.ident;
        
        item.cellRowIndex = this.cellRowInfos.scheduledItemRowIndex[item.ident];

        let itemLeftDate = value.start;
        let itemRightDateEnd;
        if (this.scheduledItemsDateFormat=="date") {
          itemRightDateEnd = moment(value.end).add(1, "days").add(-1, "seconds").toDate();
        }
        else {
          itemRightDateEnd = moment(value.end).toDate();
        }
        
        let cssClassOpen = "";
        if (value.start < timeLineStart) {
          cssClassOpen = "timeline-item-open-left";
          itemLeftDate = timeLineStart;
        }
        if (value.end > timeLineEnd) {
          cssClassOpen = "timeline-item-open-right";
          itemRightDateEnd = timeLineEnd;
        }
        if (value.start < timeLineStart && value.end > timeLineEnd) {
          cssClassOpen = "timeline-item-open";
        }
        if (cssClassOpen) item.class += " " + cssClassOpen;
        
        if (this.itemClick.observers.length > 0) item.class += " ui-clickable";
        if (this.allowDragItems) item.class += " ui-draggable";

        item.left = this.date2LeftPx(itemLeftDate);
        let itemWidthSeconds = Math.round(moment(itemRightDateEnd).diff(moment(itemLeftDate), "hours")) * 60 * 60;
        item.width = this.seconds2Px(itemWidthSeconds) - (2 * this.scheduledItemMarginHorizontal);

        let numOfItems = this.cellRowInfos.lineNumOfCellRows[item.resourceId];
        let betweenItemMargin = numOfItems>0 ? 2:0;
        let calculatedHeight = (this.rowHeight - ITEM_MARGIN_VERTICAL * 2) / numOfItems - betweenItemMargin;
        item.height = Math.min(ITEM_MAX_HEIGHT, calculatedHeight);
        item.top = this.headerHeight + this.rowHeight * rowIndexOfResourceId + ITEM_MARGIN_VERTICAL + TABLE_MARGIN_VERTICAL + TABLE_BORDER + item.cellRowIndex * (item.height + betweenItemMargin);
      }
    }
    return item;
  }

  private date2LeftPx(dateIso: string | Date): number {
    let seconds = moment(dateIso).diff(this.timeLineStartMoment, "seconds");
    let leftCol = this.showResourceColumn ? this.resourceColOuterWidth : 0;
    return leftCol + this.seconds2Px(seconds) + this.scheduledItemMarginHorizontal + this.scheduledItemMarginLeft;
  }

  private seconds2Px(seconds: number) {
    let result = seconds / this.timeLineSecondPerPx;
    result = this.roundPxToSlotWidth(result);
    return result;
  }

  private roundPxToSlotWidth(srcPx: number, roundFraction: number = 0.2) {
    let roundBase = this.timeLineSlotOuterWidth * roundFraction;
    let resultPx = Math.round(srcPx / roundBase) * roundBase;
    return resultPx;
  }

  private get timeLineSecondPerPx(): number {
    return this.timeLineSlotOuterWidth > 0 ? TIMELINE_SECONDS_PER_SLOT / this.timeLineSlotOuterWidth : 1;
  }

  protected getSlotCellLineId(scheduledItem: IScheduledItem): any;
  protected getSlotCellLineId(timelineSlotDataItem: TimelineSlotDataItem): any;
  protected getSlotCellLineId(arg1: Object): any {
    if (arg1["start"]) {
      let scheduledItem: IScheduledItem = <IScheduledItem>arg1;
      return scheduledItem.resourceId;
    }
    else {
      let timelineSlotDataItem: TimelineSlotDataItem = <TimelineSlotDataItem>arg1;
      return timelineSlotDataItem.resourceId;
    }
  }
 
}

class ScheduledItemCellRowInfo
{
  cellNumOfRows: { [resourceId: string]: { [slotDateTimeIso: string]: number } } = {};
  scheduledItemRowIndex: { [sitemIdent: string]: number } = {};
  lineNumOfCellRows: { [resourceId: string]: number } = {};
  
}





