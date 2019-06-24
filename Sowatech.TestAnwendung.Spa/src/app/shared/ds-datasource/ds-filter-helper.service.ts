import { Injectable } from '@angular/core';

import { LoggerService } from '../utilities';
import { FilterItem, FilterOperator } from './ds-dtos.model';
import { Subject } from 'rxjs/Subject';

@Injectable() export class FilterHelper {

    constructor(private loggerService: LoggerService) {
        this.filterStrategies = new Array<FilterStrategy>();
        this.filterStrategies.push(new FilterStrategyStartsWith());
        this.filterStrategies.push(new FilterStrategyIsEqual());
        this.filterStrategies.push(new FilterStrategyContains());
        this.filterStrategies.push(new FilterStrategyGreaterOrEqual());
        this.filterStrategies.push(new FilterStrategyLessOrEqual());
    }

    private filterStrategies: Array<FilterStrategy>;
    private items: Array<FilterItem> = [];
    onFilterItems = new Subject<Array<FilterItem>>();
    public get filterItems(): Array<FilterItem> { return this.items };

    private getItemByFieldNames(fieldnames: string[], filterOperator: FilterOperator): FilterItem {
        let resultItems = this.items.filter((item) => { return item.fieldnamesAreEqual(fieldnames) && item.filterOperator == filterOperator });
        if (resultItems.length > 1) console.warn("FilterHandler has duplicate fieldnames");
        return resultItems.length > 0 ? resultItems[0] : null;
    }

    public clear() {
        this.items = [];
        this.onFilterItems.next(this.items);
    }

    public add(filterItems: Array<FilterItem>);
    public add(filterItem: FilterItem);
    public add(arg: any) {
        // handle overload params
        let filterItems: Array<FilterItem>;
        if (Array.isArray(arg)) {
            filterItems = arg;
        }
        else {
            filterItems = new Array<FilterItem>();
            filterItems.push(arg);
        }
        // method body
        for (let filterItem of filterItems) {
            let existingItem = this.getItemByFieldNames(filterItem.fieldnames,filterItem.filterOperator);
            if (existingItem) {
                if (filterItem.hasFieldValue) {
                    existingItem.fieldvalues = filterItem.fieldvalues;
                    existingItem.filterOperator = filterItem.filterOperator;
                }
                else {
                    let idx = this.items.indexOf(existingItem);
                    this.items.splice(idx, 1);
                }
            }
            else {
                if (filterItem.hasFieldValue) {
                    this.items.push(filterItem);
                }
            }
        }
        this.onFilterItems.next(this.items);
    }
    public set(filterItems: Array<FilterItem>);
    public set(filterItem: FilterItem);
    public set(arg1: any) {
        this.items = [];
        this.add(arg1);
    }

    public execute(dataSourceBackup: Array<any>, dataSource: Array<any>) {
        dataSource.splice(0);
        let workSource = dataSourceBackup.slice(0);
        for (let f of this.items) {
            workSource = workSource.filter(workItem => {
                let filterOperatorStrategies = this.filterStrategies.filter(strat => strat.filterOperator == f.filterOperator);
                let filterOperatorStrategy = filterOperatorStrategies.length > 0 ? filterOperatorStrategies[0] : null;
                if (filterOperatorStrategy == null) this.loggerService.error("No strategy for filteroperator=" + f.filterOperator);
                let filterSuccess = filterOperatorStrategy ? filterOperatorStrategy.filterConditionCompare(workItem, f) : false;
                return filterSuccess;
            });
        }

        for (var workItem of workSource) {
            dataSource.push(workItem);
        }
    }

}

abstract class FilterStrategy {

    public filterOperator: FilterOperator;

    public filterConditionCompare(testedItem: any, filter: FilterItem): boolean {
        return filter.filterOperator != this.filterOperator || this.filterConditionCompareInternal(testedItem, filter);
    }

    protected filterConditionCompareInternal(testedItem: any, filter: FilterItem): boolean {
        let result: boolean = false;
        for (let fieldname of filter.fieldnames) {
            let testedValueAsString = this.getValueAsLowerCaseString(testedItem[fieldname]);
            result = this.filterConditionCompareValue(testedValueAsString, filter);
            if (result) break;
        }
        return result;
    }

    protected abstract filterConditionCompareValue(testedValue: string, filter: FilterItem): boolean;

    protected getValueAsLowerCaseString(value): string {
        let result: string = "";
        if (typeof (value) == 'string') {
            result = <string>value;
        }
        if (typeof (value) == 'number') {
            result = (<number>value).toString();
        }
        if (typeof (value) == 'boolean') {
            result = (<boolean>value).toString();
        }
        if (value instanceof Date) {
            let valueAsDate: Date = <Date>value;
            result = valueAsDate.toISOString();
        }
        return result.toLocaleLowerCase();
    }
}

class FilterStrategyStartsWith extends FilterStrategy {

    constructor() {
        super();
        this.filterOperator = FilterOperator.StartsWith;
    }

    protected filterConditionCompareValue(testedValue: string, filter: FilterItem): boolean {
        return filter.valueMatchesFilter((inputValue: string) => testedValue.indexOf(inputValue) == 0);
    }
}

class FilterStrategyIsEqual extends FilterStrategy {

    constructor() {
        super();
        this.filterOperator = FilterOperator.IsEqual;
    }

    protected filterConditionCompareValue(testedValue: string, filter: FilterItem): boolean {
        return filter.valueMatchesFilter((inputValue: string) => inputValue == testedValue);
    }

}

class FilterStrategyContains extends FilterStrategy {

    constructor() {
        super();
        this.filterOperator = FilterOperator.Contains;
    }

    protected filterConditionCompareValue(testedValue: string, filter: FilterItem): boolean {
        return filter.valueMatchesFilter((inputValue: string) => testedValue.indexOf(inputValue) >= 0);
    }

}

class FilterStrategyGreaterOrEqual extends FilterStrategy {

    constructor() {
        super();
        this.filterOperator = FilterOperator.IsGreaterOrEqual;
    }

    protected filterConditionCompareValue(testedValue: string, filter: FilterItem): boolean {
        return filter.valueMatchesFilter((inputValue: string) => inputValue <= testedValue);
    }
}

class FilterStrategyLessOrEqual extends FilterStrategy {

    constructor() {
        super();
        this.filterOperator = FilterOperator.IsLessOrEqual;
    }

    protected filterConditionCompareValue(testedValue: string, filter: FilterItem): boolean {
        return filter.valueMatchesFilter((inputValue: string) => inputValue >= testedValue);
    }
}