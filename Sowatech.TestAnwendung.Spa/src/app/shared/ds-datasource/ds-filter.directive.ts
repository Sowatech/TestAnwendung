import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../utilities';
import { DatasourceComponent } from './ds-datasource.component';
import { FilterItem, FilterOperator } from './ds-dtos.model';
import { DatasourceFilterGroupComponent } from './ds-filter-group.component';

@Directive({
    selector: '[ds-filter]'
})

export class DatasourceFilterDirective implements OnInit, OnDestroy, AfterViewInit {

    constructor(
        el: ElementRef,
        private logger: LoggerService
    ) {
        this.filterInput = el.nativeElement;
    }

     @Input('ds-filter') set dsfilter(filter: string | Array<string> | DatasourceFilterGroupComponent) {
        if (Array.isArray(filter)) {
            this.filterFields = filter;
        }
        else {
            if (typeof (filter) === 'string') {
                this.filterFields = [<string>filter];
            }
            if (typeof (filter) === 'object') {
                this.filterGroup = <DatasourceFilterGroupComponent>filter;
            }
        }
    }

    @Input('ds-filter-minlength') filterMinLength: number = 0;

    private get inputWithCheckedProperty(): boolean {
        return this.filterInput.type == "checkbox" || this.filterInput.type == "radio";
    }
    private assertInputWithCheckedProperty() {
        if (!this.inputWithCheckedProperty) this.logger.error("DatasourceFilterDirective: filter input has no check property");
    }

    @Input('datasource') set setDatasource(value: DatasourceComponent) {
        this.datasource = value;
    }
    @Input('ds-filter-operator') set filterOperatorAsString(value: string) {
        this.filterOperator = FilterOperator[value];
    }
    @Input('ds-filter-true-value') filterTrueValue: string;//der filterwert für boolean inputs wie checkboxen
    @Input('ds-filter-default') defaultFilterValues: string;

    private datasource: DatasourceComponent;

    filterFields: string | string[];//wird ignoriert wenn filterGroup
    filterOperator: FilterOperator = FilterOperator.Contains;//wird ignoriert wenn filterGroup
    filterGroup: DatasourceFilterGroupComponent;

    private filterInput: HTMLInputElement;
    get filterValue(): string {
        if (this.inputWithCheckedProperty) {
            return this.filterTrueValue;
        }
        else {
            return this.filterInput.value;
        }
    }

    private get isInputChecked(): boolean {
        this.assertInputWithCheckedProperty();
        return this.filterInput.checked;
    }

    private get modus(): ComponentModus {
        return this.filterGroup ? ComponentModus.Group : ComponentModus.Standard;
    }

    private subscriptions = new Array<Subscription>();
    ngOnInit() {
        if (this.modus == ComponentModus.Group) {
            this.subscriptions.push(this.filterGroup.onGroupItemsFilterValueChanged.subscribe((filterItems) => this.onFilterChanged(filterItems)));
        }
        else {
            this.subscriptions.push(
                this.datasource.onFilterItems.subscribe(
                    (filterItems) => {
                        this.onFilterChanged(filterItems)
                    }
                )
            );
            this.onFilterChanged(this.datasource.getFilterItems());
        }
        this.initDefaultFilter();
    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    private initDefaultFilter() {
        if (this.inputWithCheckedProperty && this.isInputChecked) {
            this.defaultFilterValues = this.filterTrueValue;
        }
        if (this.defaultFilterValues != undefined) {
            if (this.inputWithCheckedProperty) {
                this.filterInput.checked = true;
            }
            else {
                this.filterInput.value = this.defaultFilterValues;
            }
            this.addFilter();
        }
    }

    private onFilterChanged(filterItems: FilterItem[]) {
        if (filterItems.length == 0) {
            this.resetFilter();
        }
        else {
            if (this.modus == ComponentModus.Group) {
                let filterItem = filterItems[0];
                let valueIsInCurrentFilter = filterItem.fieldvalues.indexOf(this.filterValue.toLocaleLowerCase()) >= 0;
                if (valueIsInCurrentFilter) {
                    if (this.inputWithCheckedProperty) {
                        this.filterInput.checked = true;
                    }
                }
                else {
                    this.resetFilter();
                }
            }
            else {
                let myFilterItem = filterItems.find((item) => item.fieldnamesAreEqual(<string>this.filterFields) && item.filterOperator == this.filterOperator);
                //let myFilterItem = Enumerable.from(filterItems).firstOrDefault(item => item.fieldnamesAreEqual(this.filterField) && item.filterOperator == this.filterOperator);
                if (!myFilterItem) {
                    this.resetFilter();
                }
                else {
                    let filterInputValueLowerCase = this.filterInput.value.toLocaleLowerCase();
                    if (this.filterInput.tagName == 'SELECT') {
                        setTimeout(() => {
                            if (!myFilterItem.fieldnamesAreEqual(filterInputValueLowerCase)) {
                                this.filterInput.value = myFilterItem.fieldvalues.toString();
                            }
                        }, 750);
                    }
                    else {
                        if (!myFilterItem.fieldnamesAreEqual(filterInputValueLowerCase)) {
                            this.filterInput.value = myFilterItem.fieldvalues.toString();
                        }
                    }
                }
            }
        }
    }

    private resetFilter() {
        if (this.filterInput.value) this.filterInput.value = "";
        if (this.inputWithCheckedProperty && this.filterInput.checked != false) {
            this.filterInput.checked = false;
        }
    }

    @HostListener('blur') onBlur() {
        this.addFilter();
    }

    @HostListener('change') onChange() {
        this.addFilter();
    }

    private timeout: any; // NodeJS.Timer;
    @HostListener('keyup') onKeyup() {
        if (timeout != undefined) {
            clearTimeout(timeout);
        }
        var timeout = setTimeout(() => {
            timeout = undefined;
            this.addFilter();
        }, 250);
    }

    private oldFilter = undefined;
    private addFilter() {
        if (this.modus == ComponentModus.Group) {
            if (this.inputWithCheckedProperty) {

                if (this.isInputChecked) {
                    this.filterGroup.addFilter(this.filterValue);
                }
                else {
                    this.filterGroup.removeFilter(this.filterValue);
                }
            }
            else {
                if (this.filterValue.length >= this.filterMinLength && this.filterValue != this.oldFilter) {
                    this.filterGroup.removeFilter(this.oldFilter);
                    this.filterGroup.addFilter(this.filterValue);
                    this.oldFilter = this.filterValue;
                }
            }
        }
        else {
            if (this.inputWithCheckedProperty) {
                if (this.isInputChecked) {
                    this.datasource.addFilter(<string>this.filterFields, this.filterValue, this.filterOperator);
                }
                else {
                    this.datasource.addFilter(<string>this.filterFields, "", this.filterOperator);
                }
            }
            else {
                if (this.filterValue.length >= this.filterMinLength && this.filterValue != this.oldFilter) {
                    this.datasource.addFilter(<string>this.filterFields, this.filterValue, this.filterOperator);
                    this.oldFilter = this.filterValue;
                }
            }
        }
    }
}
enum ComponentModus { Standard, Group }
