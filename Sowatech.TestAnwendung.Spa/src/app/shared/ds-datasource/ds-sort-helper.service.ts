import { EventEmitter, Injectable } from '@angular/core';

import { LoggerService } from '../utilities';
import { SortItem } from './ds-dtos.model';

@Injectable() export class SortHelper {

    constructor(private loggerService: LoggerService) {
    }

    private items: Array<SortItem> = [];
    onSortItems = new EventEmitter<Array<SortItem>>();

    public get sortItems(): Array<SortItem> { return this.items }

    public clear() {
        this.items = [];
        this.onSortItems.emit(this.items);
    }

    public add(sortItem: SortItem) {

        let existingItem = this.getItemByFieldName(sortItem.fieldname);
        if (existingItem) {
            existingItem.reverse = sortItem.reverse;
        }
        else {
            this.items.push(sortItem);
        }
        this.onSortItems.emit(this.items);
    }

    public set(sortItem: SortItem) {
        this.items = [];
        if (sortItem) this.add(sortItem);
    }

    public execute(dataSource: Array<any>) {
        if (this.items.length > 0) {
            let firstAndOnlySort = this.items[0];
            if (firstAndOnlySort.reverse) {
                dataSource.sort((a, b) => { return this.compare(a[firstAndOnlySort.fieldname], b[firstAndOnlySort.fieldname], true) });
            }
            else {
                dataSource.sort((a, b) => { return this.compare(a[firstAndOnlySort.fieldname], b[firstAndOnlySort.fieldname]) });
            }
        }
    }

    private getItemByFieldName(fieldname: string): SortItem {
        let resultItems = this.items.filter((item) => { return item.fieldname == fieldname });
        if (resultItems.length > 1) console.warn("SortHandler has duplicate fieldnames");
        return resultItems.length > 0 ? resultItems[0] : null;
    }

    private compare(a: any, b: any, reverse: boolean = false): number {
        let reverseFactor = reverse ? -1 : 1;
		if (a == null || b == null) {
            let aNumber = a ? 1 : 0;
            let bNumber = b ? 1 : 0;
            return (aNumber - bNumber) * reverseFactor;
        }
        if (typeof (a) == 'string') {
            return (<string>a).localeCompare(b) * reverseFactor;
        }
        if (typeof (a) == 'number') {
            if(!a) a=0;
            if(!b) b=0;
            return (a - b) * reverseFactor;
        }
        if (typeof (a) == 'boolean') {
            let aNumber = a ? 1 : 0;
            let bNumber = b ? 1 : 0;
            return (aNumber - bNumber) * reverseFactor;
        }
        if (a instanceof Date) {
            let adate= a ? <Date>a : new Date(0);
            let bdate = b ? <Date>b : new Date(0);
            return (adate.valueOf() - bdate.valueOf()) * reverseFactor;
        }
    }
}
