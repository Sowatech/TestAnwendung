import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { LoggerService } from '../utilities';

@Injectable() export class SelectionListHelper {

    constructor(private loggerService: LoggerService) {
    }

    private selectedIds: Array<any> = [];
    private onSelectedIdsChanged: Subject<Array<any>>;
    private onFocusedIdChanged: Subject<Array<any>>;

    public init(dsSelectedIdsChangedEmitter: Subject<Array<any>>, dsFocusedIdChangedEventEmitter: Subject<any>) {
        this.onSelectedIdsChanged = dsSelectedIdsChangedEmitter;
        this.onFocusedIdChanged = dsFocusedIdChangedEventEmitter;
    }

    private doSelectionChanged() {
        this.onSelectedIdsChanged.next(this.selectedIds);
        let focusedId = this.selectedIds && this.selectedIds.length > 0 ? this.selectedIds[this.selectedIds.length - 1] : null;
        setTimeout(() => this.onFocusedIdChanged.next(focusedId),0);//unschoen, aber ansonsten regelmaessig ursache für expression changed fehler
    }

    set(ids: any[]);
    set(id: any);
    set(arg1: any) {
        if (arg1 == undefined) {
            this.loggerService.warn("SelectionListHelper.set of 'undefined' not possible");
            return;
        }
        if (Array.isArray(arg1)) {
            let ids = <any[]>arg1;
            this.selectedIds = ids;
        }
        else {
            let id = arg1;
            this.selectedIds = [id];
        }
        //todo: besser abfrage ob aenderungen
        this.doSelectionChanged();
    }

    add(ids: any[]);
    add(id: any);
    add(arg1: any) {
        if (arg1 == undefined) {
            this.loggerService.warn("SelectionListHelper.add of 'undefined' not possible");
            return;
        }

        let ids: any[];
        if (Array.isArray(arg1)) {
            ids = <any[]>arg1;
        }
        else {
            let id = arg1;
            ids = [id];
        }

        let hasChanged = false;
        for (let id of ids) {
            let indexOfId = this.selectedIds.indexOf(id);
            if (indexOfId < 0) {
                this.selectedIds.push(id);
                hasChanged = true;
            }
        }
        if (hasChanged) this.doSelectionChanged();
    }

    remove(id: any) {
        if (id == undefined) {
            this.loggerService.warn("SelectionListHelper.remove of 'undefined' not possible");
        }
        else {
            let indexOfId = this.selectedIds.indexOf(id);
            if (indexOfId >= 0) this.selectedIds.splice(indexOfId, 1);
            this.doSelectionChanged();
        }
    }

    clear() {
        if (this.selectedIds.length > 0) {
            this.selectedIds = [];
            this.doSelectionChanged();
        }
    }

    contains(id: any): boolean {
        if (id == undefined) {
            this.loggerService.warn("call of SelectionListHelper.contains(id) with id=='undefined' always returns false");
            return false;
        }
        return this.selectedIds.indexOf(id) >= 0;
    }

    getSelectedIds(): Array<any> {
        return this.selectedIds;
    }
}
