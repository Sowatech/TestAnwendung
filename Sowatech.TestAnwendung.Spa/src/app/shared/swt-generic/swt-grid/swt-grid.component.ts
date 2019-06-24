import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Language, LocaleService, TranslationService } from 'angular-l10n';
import { Subscription } from 'rxjs/Subscription';

import { DatasourceComponent, FilterOperator } from '../../ds-datasource';
import { LoadingIndicatorComponent } from '../../swt-controls/swt-loading-indicator.component';
import { DragulaService, IDragulaBagOptions, IDropEvent, IRemoveEvent } from '../../swt-dragula/swt-dragula.module';
import { LoggerService } from '../../utilities/logger.service';
import { ColSelectDialogComponent } from '../col/col-select-dialog.component';

@Component({
  selector: 'swt-grid',
  moduleId: module.id,
  templateUrl: './swt-grid.component.html',
  styleUrls: ['./swt-grid.component.scss']
})

export class GridComponent  implements OnInit, OnDestroy {

  constructor(
    public locale: LocaleService,
    public translation: TranslationService,
    private logger: LoggerService,
    private dragulaService: DragulaService
  ) {
    this.datePipe = new DatePipe(locale.getCurrentLanguage());
    this.decimalPipe = new DecimalPipe(locale.getCurrentLanguage());
  }

  @
  Language() lang: string;
  private datePipe: DatePipe;
  private decimalPipe: DecimalPipe;

  private subscriptions = new Array<Subscription>();
  ngOnInit() {
  }

  ngOnDestroy() {
    for (var s of this.subscriptions) {
      s.unsubscribe();
    }
  }

  @Input() idfield: string = "";
  @Input('datasource') set setListDatasource(value: DatasourceComponent) {
    this.listDatasource = value;
  }
  @Input() name: string = "";
  @Input() small: boolean = true;
  @Input() minHeight: string = "300px";
  @Input() rowHeight: number;

  @Input('store-key') gridStoreKey: string;
  @Input() gridClass: string;//additional css classes
  @Input() allowFilter: boolean = true;
  @Input() allowSort: boolean = true;
  @Input() allowPaging: boolean = true;
  @Input() allowMultiSelect: boolean = false;
  @Input() showEmptyGrid: boolean;
  @Input() emptyGridText: string = "(Keine Datensätze)";
  @Input() filterFieldsVisible: boolean = true;
  @Input() sortItemAlign: IconAlignType = 'right';
  @Input() html5Draggable: string = null;//if!=null: shows an Icon with draggable=true, the given text will be shown as title
  @Output() onHtml5DragStart = new EventEmitter<Html5DragDropEvent>();

  @Input('dragulaBag') set setDragulaBag(value: string) {
    this.dragulaBag = value;
    if (this.dragulaBag) {
      this.subscriptions.push(
        this.dragulaService.onDrop.subscribe((value) => this.onRowDrop(value)),
        this.dragulaService.onRemove.subscribe((value) => this.onRowRemove(value))
      );
    }
  };
  @Input('dragulaOptions') set setDragulaOptions(value: IDragulaBagOptions) {
    for (let option in value) {
      this.dragulaOptions[option] = value[option];
    }
  };

  public dragulaOptions: IDragulaBagOptions = {
    removeOnSpill: false,
    moves: (item: HTMLElement, container: HTMLElement, handle: HTMLElement, nextElement: HTMLElement) => {
      let result = item.classList.contains('dragula-handle');
      return result;
    }
  };
  public dragulaBag: string;

  @Input() showSelectCheckBoxes: boolean = false;
  @Input('table-hover') tableHover: boolean = false;
  @Input('config') set setConfig(value: GridConfiguration) { this.configureGrid(value); };

  @Output() onButtonClicked = new EventEmitter<GridColumnButtonEvent>();
  @Output() onRowClicked = new EventEmitter<RowClickEvent>();
  @Output() onDrop = new EventEmitter<GridDropEvent>();
  @Output() onDragulaRemove = new EventEmitter<GridDropRemoveEvent>();

  @ViewChild('loadingIndicator') loadingIndicator: LoadingIndicatorComponent;

  listDatasource: DatasourceComponent;
  public set columns(allColumns: GridColumn[]) {
    this.prepareColumns(allColumns);
    this.setVisibleColumns(allColumns);
  }
  public visibleColumns: GridColumn[] = [];
  private setVisibleColumns(columns: GridColumn[]) {
    this.visibleColumns = columns;
  }
  public get rowCursorClass(): string {
    if ((<any>this.onRowClicked).observers.length > 0) {
      return "pointer";
    }
    else {
      return "default";
    }
  }

  private prepareColumns(allColumns: GridColumn[]) {
    for (let col of allColumns) {
      if (col.type == "boolean") {
        if (!col.trueValueText) col.trueValueText = "true";
        if (!col.falseValueText) col.falseValueText = "false";
      }
      if (col.lookups && col.lookups.length > 0) {
        if (typeof (col.lookups[0]) == 'string') {
          let selectItemLookUps = new Array<SelectItem>();
          for (let lookup of col.lookups) {
            let selectItem: SelectItem = {
              value: <string>lookup,
              text: <string>lookup
            };
            selectItemLookUps.push(selectItem);
          }
          col.lookups = selectItemLookUps;
        }
      }
    }
  }

  //alternative configuration by GridConfiguration-object instead of setting inputs and columns
  public configureGrid(config: GridConfiguration) {
    this.columns = config.columns;
    for (var prop in config) {
      if (prop != "columns") {
        if (config[prop] != undefined && this[prop] != undefined) this[prop] = config[prop];
      }
    }
  }

  public getData():object[]{
    if(!this.listDatasource) return [];
    let result=[];
    for(let listItem of this.listDatasource.dataBackup){
      let resultItem={};
      result.push(resultItem);
      for(let column of this.visibleColumns){
        resultItem[column.text]=this.displayText(listItem,column);
      }
    }
    return result;
  }


  private displayText(listItem: any, column: GridColumn): string {

    //let displayFromLookup = column.lookups && column.lookups.length > 0 && (typeof (column.lookups[0]) != 'string');
    let value = listItem[column.fieldname];
    let dateFormat = column.dateFormat ? column.dateFormat : 'mediumDate';
    switch (column.type) {
      case "boolean":
        if (value == true && column.trueValueText != undefined) value = column.trueValueText;
        if (value == false && column.falseValueText != undefined) value = column.falseValueText;
        break;
      case "lookup":
        value = this.getLookupTextColumn(listItem, column);
        break;
      case "date":
        if (value) {
          value = this.datePipe.transform(value, dateFormat);
        }
        break;
      case 'datetime':
        if (value) {
          value = this.datePipe.transform(value, dateFormat) + " " + this.datePipe.transform(value, 'mediumTime');
          //https://angular.io/docs/ts/latest/api/common/index/DatePipe-pipe.html
        }
        break;
      case 'number':
        if (value != undefined) {
          value = this.decimalPipe.transform(value, column.digitInfo ? column.digitInfo : "1.0-2");
        }
        break;
      default:
        break;
    }
    if (value == undefined || value == null) value = "";
    if (value && column.unit) {
      value += " " + column.unit;
    }
    return value;
  }

  public getLookupTextColumn(listItem: any, column: GridColumn): string {
    let value = listItem[column.fieldname];
    let lookupItems = (<SelectItem[]>column.lookups).filter((lookup: SelectItem) => lookup.value == value);
    return lookupItems.length > 0 ? lookupItems[0].text : "";
  }

  public allowSortColumn(column: GridColumn): boolean {
    return this.allowSort && (column.allowSort == undefined || column.allowSort);
  }

  public allowFilterColumn(column: GridColumn): boolean {
    return this.allowFilter && (column.allowFilter == undefined || column.allowFilter);
  }

	public getFilterOperator(column: GridColumn): string {
		let result: FilterOperator = null;
		if (column.filterOperator >= 0) {
			result = column.filterOperator;
		}
		else {
			switch (column.type) {
				case "boolean":
					result = FilterOperator.IsEqual;
					break;
				default:
					if (column.lookups) {
						result = FilterOperator.IsEqual;
					}
					else {
						result = FilterOperator.Contains;
					}
					break;
			}
		}
		return FilterOperator[result];
	}

  private autoDetectIdFieldname(listItem: any) {

    if (!this.idfield && listItem["id"] != null) {
      this.idfield = "id";
    }
    if (!this.idfield && listItem["Id"] != null) {
      this.idfield = "Id";
    }
    if (!this.idfield && listItem["ID"] != null) {
      this.idfield = "ID";
    }
    if (!this.idfield) {
      this.logger.warn("GridComponent: unknown idfield ");
    }
  }

  private getListItemId(listItem: any): any {
    this.autoDetectIdFieldname(listItem);
    return listItem[this.idfield];
  }

  public buttonClicked($event: MouseEvent, ident: string, listItem: any) {
    $event.stopPropagation();//prevents bubble of click-event to tr
    this.onButtonClicked.emit({ buttonIdent: ident, itemId: this.getListItemId(listItem), $event: $event });
  }

  public rowClick($event: MouseEvent, listItem: any) {
    let listItemId = this.getListItemId(listItem);
    if (this.allowMultiSelect && $event.ctrlKey) {
      this.listDatasource.toggleSelection(listItemId);
    } else {
      this.listDatasource.focus(listItemId);
    }

    this.onRowClicked.emit({ itemId: listItemId, $event: $event });
  }

  public html5DragStart($event: DragEvent, listItem:any) {
    let listItemId = this.getListItemId(listItem);
    this.onHtml5DragStart.emit({ itemId: listItemId, $event: $event });
  }

  public isSelected(listItem: any): boolean {
    return this.listDatasource.isSelected(this.getListItemId(listItem));
  }

  //--- column visbility handling

  public visibilityKey(gridColumn: GridColumn): string {
    return gridColumn.fieldname ? this.gridStoreKey + "." + gridColumn.fieldname : null;
  }

  @ViewChild('colSelectDialog') colSelectDialog: ColSelectDialogComponent;
  public showColSelectDialog() {
    this.configureColSelectDialog();
    this.colSelectDialog.showDialog();
  }

  private configureColSelectDialog() {
    if (!this.colSelectDialog.isConfigured) {
      let selectDialogColumns = this.visibleColumns
        .filter((gridColumn: GridColumn) => {
          return gridColumn.fieldname;
        })
        .map((gridColumn: GridColumn) => {
          return {
            key: this.visibilityKey(gridColumn),
            text: gridColumn.text
          }
        });
      this.colSelectDialog.configureColumns(selectDialogColumns);
    }
  }

  private columnClass(column: GridColumn, listItem: any): string {
    let base = column["bodyClass"] ? column.bodyClass : "";
    let postfix = column["bodyClassFieldname"] ? listItem[column.bodyClassFieldname] : "";
    return base + " " + postfix;
  }

  //--- Buttns and Spans

  private spansBefore(gridColumn: GridColumn): Array<GridColumnSpan> {
    let result = [];
    if (gridColumn.spans) {
      result = gridColumn.spans.filter(span => span["positionBefore"] == undefined || span.positionBefore);
    }
    return result;
  }

  private spansAfter(gridColumn: GridColumn): Array<GridColumnSpan> {
    let result = [];
    if (gridColumn.spans) {
      result = gridColumn.spans.filter(span => span["positionBefore"] != undefined && !span.positionBefore);
    }
    return result;
  }

  private spanText(listItem: any, span: GridColumnSpan): string {
    return span["textFieldname"] ? listItem[span.textFieldname] : "";
  }

  private spanTitle(listItem: any, span: GridColumnSpan): string {
    return span["titleFieldname"] ? listItem[span.titleFieldname] : "";
  }

  private spanClass(listItem: any, span: GridColumnSpan): string {
    let base = span["class"] ? span.class : "";
    let postfix = span["classFieldname"] ? listItem[span.classFieldname] : "";
    return base + " " + postfix;
  }

  private getButtonClass(listItem: any, btn: GridColumnButton): string {
    let size = this.small ? "btn-xs" : "btn-sm";
    let base = btn["buttonClass"] ? btn.buttonClass : "";
    let postfix = btn["buttonClassFieldname"] ? listItem[btn.buttonClassFieldname] : "";
    return size + " " + base + " " + postfix;
  }

  //-- DragDrop
  private onRowDrop(event: IDropEvent) {
    if (this.dragulaBag && this.dragulaBag == event.bagName) {
      let gridDropEvent: GridDropEvent = new GridDropEvent();
      let id = event.droppedElement.attributes["data-id"].value;
      gridDropEvent.editItem = this.listDatasource.getDataItem(id);
      gridDropEvent.sourceContainer = event.sourceContainer;
      gridDropEvent.destinationContainer = event.dropContainer;
      gridDropEvent.dropElement = event.droppedElement;

      gridDropEvent.nextElement = event.nextElement;
      let nextId = event.nextElement && event.nextElement.attributes["data-id"] ? event.nextElement.attributes["data-id"].value : null;
      if (nextId) {
        gridDropEvent.nextItem = this.listDatasource.getDataItem(nextId);
      }

      let bag = this.dragulaService.find(this.dragulaBag);
      if (bag) bag.drake.cancel(true); //prevents changes of HTML DOM
      if (gridDropEvent.editItem) this.onDrop.emit(gridDropEvent);
    }
  }

  private onRowRemove(event: IRemoveEvent) {
    if (this.dragulaBag && this.dragulaBag == event.bagName) {

      let gridDropRemoveEvent: GridDropRemoveEvent = new GridDropRemoveEvent();
      let id = event.droppedElement.attributes["data-id"].value;
      gridDropRemoveEvent.editItem = this.listDatasource.data.find(ld => ld[this.idfield] == id);
      gridDropRemoveEvent.sourceContainer = event.sourceContainer;
      this.onDragulaRemove.emit(gridDropRemoveEvent);
    }
  }
}

export type IconAlignType = 'left' | 'right';
export type GridColumnType = 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'url' | 'email' | 'tel' | 'buttons' | 'empty' | 'lookup';

export class GridDropEvent {
  sourceContainer: HTMLElement;
  destinationContainer: HTMLElement;
  dropElement: HTMLElement;
  nextElement?: HTMLElement;
  nextItem?: any;
  editItem: any;
}

export class GridDropRemoveEvent {
  sourceContainer: HTMLElement;
  editItem: any;
}

export class GridColumn {
  text?: string;
  fieldname?: string;
  hideFieldValue?: boolean;
  type?: GridColumnType;
  lookups?: Array<SelectItem> | Array<string>;
  trueValueText?: string;//nur fuer type=boolean
  falseValueText?: string;//nur fuer type=boolean
  unit?: string;
  digitInfo?: string;//{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}; defaults to "1.0-2"
  dateFormat?: string;// for type date|dateTime only. defaults to 'mediumDate';

  buttons?: Array<GridColumnButton>;
  buttonsAsDropdown?: string;//shows buttons as a dropdown menu. string is used as dropdown-text
  spans?: Array<GridColumnSpan>;
  minWidth?: string;
  width?: string;
  textAlign?: "right" | "left" | "center";

  bodyClass?: string;
  bodyClassFieldname?: string;

  headerClass?: string;

  allowFilter?: boolean;//default true
  allowSort?: boolean;//default true
  filterOperator?: FilterOperator;


}

export class GridColumnButton {
  ident?: string;
  text?: string;
  tooltip?: string;
  buttonClass?: string;
  iconClass?: string;
  buttonClassFieldname?: string;
  iconClassFieldname?: string;
}

export class RowClickEvent {
  $event: MouseEvent;
  itemId: any;
}

export class Html5DragDropEvent {
  $event: DragEvent;
  itemId: any;
}

export class GridColumnButtonEvent {
  buttonIdent: string;
  itemId: any;
  $event: MouseEvent;
}

export class GridColumnSpan {
  class?: string;//static css class
  classFieldname?: string;//fieldname in edit item which provides the css class of the icon/span
  textFieldname?: string;//fieldname in edit item which provides the css class for the text
  titleFieldname?: string;//fieldname in edit item which provides the css class of the title
  positionBefore?: boolean;
  
  isIcon?: boolean; //obsolete, user variant instead
  variant?: "label" | "icon" | "progress" = "label";
}

export class GridConfiguration {
  columns: Array<GridColumn> = [];

  idfield?: string;
  small?: boolean = true;
  gridStoreKey?: string;
  gridClass?: string;//additional css classes
  allowFilter?: boolean = true;
  allowSort?: boolean = true;
  allowPaging?: boolean = true;
  allowMultiSelect?: boolean = false;
  tableHover?: boolean = false;
  showSelectCheckBoxes?: boolean = false;
  showEmptyGrid?: boolean = false;
  emptyGridText?: string = "(Keine Datensätze)";
  dragulaBag?: string = null;
  filterFieldsVisible?: boolean = true;
}

@Component({
  selector: 'grid-cell-span',
  moduleId: module.id,
  styles: ['.span-progress{  line-height:0;  width:100%;  display:inline-block;}'],
  template: `
        <ng-container *ngFor="let span of spans">
            <span *ngIf="(!span.variant && !span.isIcon) || span.variant=='label'" class="m-r-xs" [ngClass]="spanClass(span)" [title]="spanTitle(span)">{{spanText(span)}}</span>
            <i *ngIf="span.variant=='icon' || span.isIcon" class="m-r-xs" [ngClass]="spanClass(span)" [title]="spanTitle(span)">{{spanText(span)}}</i>
            <div class="span-progress" *ngIf="span.variant=='progress'">
                <span class="stat-percent" [title]="spanTitle(span)">{{spanNumber(span)|percent:'1.0-0'}}</span>
                <div class="progress progress-mini" [title]="spanTitle(span)" [style.margin-top.px]="7">
                    <div class="progress-bar" [ngClass]="spanClass(span)" [style.width.%]="spanNumber(span)*100"></div>
                </div>
            </div>
        </ng-container>
`
})
export class GridCellSpanComponent {

  @Input('spans') spans: GridColumnSpan[];
  @Input('listItem') listItem: any;

  public spanText(span: GridColumnSpan): string {
    return span["textFieldname"] ? this.listItem[span.textFieldname] : "";
  }

  public spanNumber(span: GridColumnSpan): number {
    return span["textFieldname"] ? +this.listItem[span.textFieldname] : 0;
  }

  public spanTitle(span: GridColumnSpan): string {
    return span["titleFieldname"] ? this.listItem[span.titleFieldname] : "";
  }

  public spanClass(span: GridColumnSpan): string {
    let base = span["class"] ? span.class : "";
    let postfix = span["classFieldname"] ? this.listItem[span.classFieldname] : "";
    return base + " " + postfix;
  }

}
