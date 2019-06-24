import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../../utilities/logger.service';
import { ColVisibilityService } from './col-visibility.service';

@Component({
    selector: 'col-select-dialog',
    moduleId: module.id,
    templateUrl: "./col-select-dialog.component.html"
})

export class ColSelectDialogComponent  implements OnInit, OnDestroy {

    constructor(
        public translation: TranslationService,
        private logger: LoggerService, 
        private colVisibilityService: ColVisibilityService
    ) {
        this.translation.init();
    }
    @Language() lang: string;
    private subscriptions = new Array<Subscription>();

    ngOnInit() {
        this.dialogTitle = this.translation.translate("COL_SELECT_DIALOG.DIALOG_TITLE");
    }

    ngOnDestroy() {
        for (var s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    dialogTitle: string;

    @ViewChild('dialog') dialog: ModalDirective;
    @Output('onSubmit') onSubmit: EventEmitter<string[]> = new EventEmitter<string[]>();

    public configureColumns(columns: IColumnKeyText[]) {
        this.dialogFields = new Array<any>();
        for (let col of columns) {
            let dialogField: any = {};
            dialogField.fieldname = col.key;
            dialogField.text = col.text;
            dialogField.type = "boolean";
            this.dialogFields.push(dialogField);
        }
    }

    public get isConfigured(): boolean {
        return this.dialogFields && this.dialogFields.length > 0;
    }
    dialogFields: Array<any>;

    private editItem: ColumnVisibility = {};
    public showDialog() {
        this.editItem = this.createColumnVisibility();
        this.dialog.show();
    }

    private createColumnVisibility(): ColumnVisibility {
        let columnVisibilityDto: ColumnVisibility = {};
        for (let dialogField of this.dialogFields) {
            let isColVisible = this.colVisibilityService.isColumnVisible(dialogField.fieldname);
            columnVisibilityDto[dialogField.fieldname] = isColVisible;
        }
        return columnVisibilityDto;
    }

    submitDialog() {
        this.onSubmitColumnVisiblity(this.editItem);
    }

    cancelDialog() {
        this.dialog.hide();
    }

    private onSubmitColumnVisiblity(columnVisiblity: ColumnVisibility) {
        let visibleFieldnames = new Array<string>();
        let hiddenFieldnames = new Array<string>();

        for (let dialogField of this.dialogFields) {
            let columnIsVisible = this.editItem[dialogField.fieldname];
            if (columnIsVisible) {
                visibleFieldnames.push(dialogField.fieldname);
            }
            else {
                hiddenFieldnames.push(dialogField.fieldname);
            }
        }
        this.colVisibilityService.updateColumnVisibility(visibleFieldnames, hiddenFieldnames);
        this.dialog.hide();
        this.onSubmit.emit(hiddenFieldnames);
    }

}

interface ColumnVisibility {
}

export interface IColumnKeyText {
    key: string;
    text: string;
}

