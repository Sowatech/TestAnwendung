import { Injectable } from '@angular/core';

import { LoggerService } from '../../utilities';
import { TIntervalSelectType } from './swt-date-interval.model';

const STOREKEY_PREFIX = "SwtDateIntervalStore.";
const STOREKEY_SELECTEDDATE_POSTFIX = '.SelectedDate';
const STOREKEY_SELECTEDFROMDATE_POSTFIX = '.SelectedFromDate';
const STOREKEY_SELECTEDITEMVALUE_POSTFIX = '.SelectedItemValue';

@Injectable() export class SwtDateIntervalStoreHelper {
    //private storeKey: string;

    constructor(private loggerService: LoggerService) { }

    //public init(storeKey: string) { this.storeKey = storeKey; }
    
    public clearStorage(storeKey: string) {
        this.loggerService.log("SwtDateIntervalStoreHelper.clearStorage");
        localStorage.setItem(this.selectedDateKey(storeKey), "");
        localStorage.setItem(this.selectedFromDateKey(storeKey), "");
        localStorage.setItem(this.selectedItemValueKey(storeKey), "");
    }
    
    public loadFromStorage(storeKey: string): DateIntervalStoredData {
        this.loggerService.log("SwtDateIntervalStoreHelper.loadFromStorage");
        let result = new DateIntervalStoredData(
            <string>JSON.parse(localStorage.getItem(this.selectedDateKey(storeKey))),
            <string>JSON.parse(localStorage.getItem(this.selectedFromDateKey(storeKey))),
            <number>JSON.parse(localStorage.getItem(this.selectedItemValueKey(storeKey))));

        return result;
    }

    public saveToStorage(storeKey: string, start: string, end: string, intervalSelectType: TIntervalSelectType) {
        this.loggerService.log("SwtDateIntervalStoreHelper.saveToStorage");
        localStorage.setItem(this.selectedDateKey(storeKey), JSON.stringify(start));
        localStorage.setItem(this.selectedFromDateKey(storeKey), JSON.stringify(end));
        localStorage.setItem(this.selectedItemValueKey(storeKey), JSON.stringify(intervalSelectType));
    }

    private selectedDateKey(storeKey: string): string {
        return STOREKEY_PREFIX + storeKey + STOREKEY_SELECTEDDATE_POSTFIX;
    }

    private selectedFromDateKey(storeKey: string): string {
        return STOREKEY_PREFIX + storeKey + STOREKEY_SELECTEDFROMDATE_POSTFIX;
    }

    private selectedItemValueKey(storeKey: string): string {
        return STOREKEY_PREFIX + storeKey + STOREKEY_SELECTEDITEMVALUE_POSTFIX;
    }
}

class DateIntervalStoredData {
    constructor(start: string, end: string, intervalSelectType: TIntervalSelectType) {
        this.start = start;
        this.end = end;
        this.intervalSelectType = intervalSelectType;
    }
    start: string;
    end: string;
    intervalSelectType: TIntervalSelectType;
}
