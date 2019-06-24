import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../utilities/logger.service';
import { DatasourceComponent } from './ds-datasource.component';

@Component({
    selector: "ds-selection-checkbox",
    template: `<input type="checkbox" #checkboxcontrol [(ngModel)]="isChecked" (click)="onClick($event)"/>`
})
export class DatasourceSelectionCheckboxComponent implements OnInit, OnDestroy {
    constructor(private loggerService: LoggerService) {}

    private subscriptions = new Array<Subscription>();
    ngOnInit() {
        this.subscriptions.push(
            this.datasource.onSelectedIdsChanges.subscribe((selectedIds: any[]) => {
                this.onSelectedIdsChanges(selectedIds);
            }),
            this.datasource.onAfterRefresh.subscribe(() => {
                this.toogleIsCheckedIfNesseary();
            })
        );

        this._isChecked = this.selectId != undefined &&  this.datasource.isSelected(this.selectId);
    }

    ngOnDestroy() {
        this.subscriptions.map(s => s.unsubscribe());
    }

    @Input()
    datasource: DatasourceComponent;
    @Input()
    allowMultiSelect: boolean;
    @Input("ds-select")
    selectId: any;
    @ViewChild("checkboxcontrol")
    checkboxControl: HTMLInputElement;

    private toogleIsCheckedIfNesseary() {
        if (!this.selectId && this.datasource.selectedIds.length == 0) {
            this.multiSelectIsChecked = false;
        }
    }

    //isChecked: boolean = false;
    private _isChecked: boolean = false;
    private multiSelectIsChecked: boolean = false;
    set isChecked(value: boolean) {
        if (this.selectId) {
            if (value == this._isChecked) return;
            if (value) {
                if (this.allowMultiSelect) {
                    this.datasource.addSelection(this.selectId);
                } else {
                    this.datasource.focus(this.selectId);
                }
            } else {
                this.datasource.removeSelection(this.selectId);
            }
        } else {
            if (value == this.multiSelectIsChecked) return;
            this.multiSelectIsChecked = value;
            this.datasource.toggleAllFilteredSelected(this.multiSelectIsChecked);
        }
    }

    get isChecked(): boolean {
        if (this.selectId) return this._isChecked;
        else return this.multiSelectIsChecked;
    }

    private onSelectedIdsChanges(selectedIds: any[]) {
        if (this.selectId) {
            let isInSelection = selectedIds.indexOf(this.selectId) >= 0;
            if (isInSelection != this._isChecked) this._isChecked = isInSelection;
        } else {
            this.multiSelectIsChecked = this.datasource.dataFiltered.length == selectedIds.length && selectedIds.length > 0;
        }
    }

    public onClick($event: MouseEvent) {
        $event.stopPropagation();
    }
}
