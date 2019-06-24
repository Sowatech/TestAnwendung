import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../utilities/logger.service';
import { DatasourceComponent } from './ds-datasource.component';
import { FilterItem, FilterOperator } from './ds-dtos.model';

@Component({
    selector: 'ds-filterdisplay',
  template: ` <code style="white-space: normal;" *ngIf="isFilterSet && filterFieldsVisible">{{filterText}} <i class="fa fa-undo" style="cursor:pointer" title="Filter zurücksetzen" (click)="clearFilter()"></i></code>
              <button style="white-space: normal;" *ngIf="isFilterSet && !filterFieldsVisible" type="button" class="btn btn-default btn-xs" (click)="clearFilter()" title="Filter zurücksetzen"> {{filterText}} <i class="fa fa-times-circle"></i></button>`
})

export class DatasourceFilterdisplayComponent implements OnInit, OnDestroy {

    constructor(
        private loggerService: LoggerService
    ) {
    }

    private subscriptions = new Array<Subscription>();
    public isFilterSet: boolean = false;

    ngOnInit() {
        this.subscriptions.push(this.datasource.onFilterItems.subscribe((filterItems) => {this.onDatasourceFilterChanged(filterItems);}));
        this.onDatasourceFilterChanged(this.datasource.getFilterItems());
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    @Input() datasource: DatasourceComponent;
    @Input() filterFieldsVisible: boolean = true;

    filterText: string;

    private onDatasourceFilterChanged(filterItems: FilterItem[]) {
        //setTimeout: fix zur verhinderung des fehlers 'Expression changed after checked'
        setTimeout(() => {
            this.isFilterSetCheck(filterItems);
            this.createFilterText(filterItems);
        },0);
    }

    private isFilterSetCheck(filterItems: FilterItem[]) {
      this.isFilterSet = filterItems.length > 0 ? true : false;
    }

    private createFilterText(filterItems: FilterItem[]) {
      this.filterText = "";
      if (this.filterFieldsVisible) {
        var textParts = new Array<string>();
        for (var f of filterItems) {
          let fieldvalue = f.hasFieldValue ? f.fieldvalues.join(" OR ") : "NULL";
          let fieldnamePartText = f.fieldnames.join(" OR ");
          let textpart = `[${fieldnamePartText}] ${FilterOperator[f.filterOperator]} '${fieldvalue}'`;
          textParts.push(textpart);
        }
        this.filterText = textParts.join(" AND ");
      }
      else {
        this.filterText = "Filter zurücksetzen";
        //optional: Set Filter text for locale (translation);
      }
    }

    clearFilter() {
        this.datasource.clearFilter();
    }
}
