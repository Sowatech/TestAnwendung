import { EventEmitter, Injectable } from '@angular/core';

import { LoggerService } from '../../utilities';

const STOREKEY_PREFIX = "ColVisibility.";

@Injectable()
export class ColVisibilityService {

    constructor(private logger: LoggerService) {
    }

    private storageKey(fieldname: string): string {
        return STOREKEY_PREFIX + fieldname;
    }

    public isColumnVisible(fieldname: string): boolean {
        let hiddenStored = localStorage.getItem(this.storageKey(fieldname));
        return hiddenStored ? false : true;
    }

    public updateColumnVisibility(visibleFieldnames: string[], hiddenFieldnames: string[]) {
        for (let fieldname of visibleFieldnames) {
            localStorage.removeItem(this.storageKey(fieldname));
        }
        for (let fieldname of hiddenFieldnames) {
            localStorage.setItem(this.storageKey(fieldname), "hidden");
        }

        this.hiddenColumnsChanged.emit(hiddenFieldnames);
    }
    
    public hiddenColumnsChanged: EventEmitter<string[]> = new EventEmitter<string[]>();
}


