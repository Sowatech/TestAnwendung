import { Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../utilities/logger.service';
import { DatasourceComponent } from './ds-datasource.component';
import { FilterItem, FilterOperator } from './ds-dtos.model';

@Component({
    selector: 'ds-filter-group',
    template: ``,
})

export class DatasourceFilterGroupComponent implements OnInit, OnDestroy {

    constructor(private logger: LoggerService) {
    }

    private subscriptions = new Array<Subscription>();
    ngOnInit() {
        this.subscriptions.push(this.datasource.onFilterItems.subscribe((filterItems) => {
            this.onFilterChanged(filterItems);
        }));
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    @Input('ds-filter-group-field') filterField: string;
    @Input() datasource: DatasourceComponent;
    @Input('ds-filter-operator') set filterOperatorAsString(value: string) {
        this.filterOperator = FilterOperator[value];
    }

    filterOperator: FilterOperator = FilterOperator.IsEqual;
    filterValues: Array<string> = [];

    onGroupItemsFilterValueChanged = new EventEmitter<Array<FilterItem>>();
    private onFilterChanged(filterItems: FilterItem[]) {
        let myFilterItems = filterItems.filter(item => item.fieldnamesAreEqual(this.filterField));
        if (myFilterItems.length == 0) {
            this.resetFilter();
            this.onGroupItemsFilterValueChanged.emit([]);
        }
        else {
            this.onGroupItemsFilterValueChanged.emit(myFilterItems);
        }
    }

    private resetFilter() {
        this.filterValues = [];
    }

    public addFilter(filterValue: string);
    public addFilter(filterValues: string[]);
    public addFilter(arg1: any) {
        let filterValues: string[] = Array.isArray(arg1) ? arg1 : [arg1];
        for (let filterValue of filterValues) {
            if (this.filterValues.indexOf(filterValue) < 0) this.filterValues.push(filterValue);
        }
        this.refreshDataSource();
    }

    public removeFilter(filterValue: string);
    public removeFilter(filterValues: string[]);
    public removeFilter(arg1: any) {
        let filterValues: string[] = Array.isArray(arg1) ? arg1 : [arg1];
        for (let filterValue of filterValues) {
            let removedIndex = this.filterValues.indexOf(filterValue);
            if (removedIndex >= 0) this.filterValues.splice(removedIndex,1);
        }
        this.refreshDataSource();
    }

    private refreshDataSource() {
        this.datasource.addFilter(this.filterField, this.filterValues, this.filterOperator);
    }
}
