import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Language, LocaleService, TranslationService } from 'angular-l10n';
import { Subscription } from 'rxjs/Subscription';

import { DialogResult, MessageBoxService, MessageButtons, MessageType } from '../../dialogs';
import { DatasourceComponent } from '../../ds-datasource/ds-datasource.component';
import { LoadingIndicatorComponent } from '../../swt-controls/swt-loading-indicator.component';
import { LoggerService } from '../../utilities/logger.service';
import { GenericEditDialogComponent } from '../swt-generic-edit-dialog/swt-generic-edit-dialog.component';
import { DialogField } from '../swt-generic-edit-dialog/swt-generic-edit-dialog.types';
import { ListEditorWebApiService } from './swt-list-editor-web-api.service';


@Component({
    selector: 'swt-list-editor',
    moduleId: module.id,
    templateUrl: './swt-list-editor.component.html'
})

export class ListEditorComponent implements OnInit, OnDestroy {

    constructor(
        public translation: TranslationService,
        private logger: LoggerService,
        private messageBoxService: MessageBoxService,
        public locale: LocaleService
    ) {
        this.datePipe = new DatePipe(locale.getCurrentLanguage());
    }

    @Language() lang: string;
    private datePipe: DatePipe;
    @Input() idFieldname: string;
    public set columns(allColumns: ListColumn[]) {
        for (let col of allColumns) {
            if (col.type == "boolean") {
                if (!col.trueValueText) col.trueValueText = "true";
                if (!col.falseValueText) col.falseValueText = "false";
            }
        }
        this.setVisibleColumns(allColumns);
        this.setEditableColumns(allColumns);
        this.editDialog.configureDialogFields(this.editableColumns);
        this.refresh();
    }
    visibleColumns: ListColumn[] = [];

    private setEditableColumns(columns: ListColumn[]) {
        this.editableColumns = columns.filter((col) => col.fieldname != this.idFieldname && !col.hiddenInDialog);
    }
    private editableColumns: DialogField[] = [];

    private setVisibleColumns(columns: ListColumn[]) {
        this.visibleColumns = columns.filter((col) => !col.hiddenInList);
    }

    public set webApiService(value: ListEditorWebApiService<any>) {
        this._webApiService = value;
        this.refresh();
    }
    private _webApiService: ListEditorWebApiService<any>;

    @ViewChild('editDialog') editDialog: GenericEditDialogComponent<any>;
    @ViewChild('listDatasource') listDatasource: DatasourceComponent;
    @ViewChild('loadingIndicator') loadingIndicator: LoadingIndicatorComponent;

    @Input() titleSingular: string;
    @Input() titlePlural: string;
    @Input() small: boolean = true;

    private subscriptions = new Array<Subscription>();

    ngOnInit() {
        this.subscriptions.push(this.editDialog.onSubmit.subscribe((editItem: any) => this.onSubmitEditDialog(editItem)));
    }

    ngOnDestroy() {
        for (var s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    listItems: Array<any> = [];

    private async refresh(focusId?: number) {
        if (!this.visibleColumns || this.visibleColumns.length == 0 || !this._webApiService) return;
        this.loadingIndicator.show();
        try {
            let dtos: any[] = await this._webApiService.getList();
            this.listItems = dtos;
            this.loadingIndicator.hide();
            this.logger.log("ListEditorComponent.getList/success");
            if (focusId) {
                this.listDatasource.focus(focusId);
            }
        }
        catch (error) {
            this.loadingIndicator.hide();
            this.logger.log("ListEditorComponent.getList/error");
            this.logger.error(error);
            this.messageBoxService.showDialog("Fehler Laden der Daten vom Server", "Fehler", MessageType.ERROR, MessageButtons.CLOSE);
        }
    }

    private autoDetectIdFieldname(listItem: any) {
        if (!this.idFieldname && listItem["id"] != null) {
            this.idFieldname = "id";
        }
        if (!this.idFieldname && listItem["Id"] != null) {
            this.idFieldname = "Id";
        }
        if (!this.idFieldname && listItem["ID"] != null) {
            this.idFieldname = "ID";
        }
        if (!this.idFieldname) {
            this.logger.error("ListEditorComponent: unknown IdField ");
        }
    }

    private getListItemId(listItem: any): any {
        this.autoDetectIdFieldname(listItem);
        return listItem[this.idFieldname];
    }

    private displayText(listItem: any, column: ListColumn): string {

        let displayFromLookup = column.lookUps && column.lookUps.length > 0 && (typeof (column.lookUps[0]) != 'string');
        if (!displayFromLookup) {
            let value = listItem[column.fieldname];
            if (value != undefined && value != null) {
                switch (column.type) {
                    case 'boolean':
                        if (value == true && column.trueValueText != undefined) value = column.trueValueText;
                        if (value == false && column.falseValueText != undefined) value = column.falseValueText;
                        break;
                    case 'date':
                        value = this.datePipe.transform(value, 'dd.MM.yyyy');
                        break;
                    default:
                        // value = value;
                        break;
                }
                if (column.unit) {
                    value += " " + column.unit;
                }
            }
            return value;
        }
        else {
            return this.getLookupTextColumn(listItem, column);
        }
    }

    public getLookupTextColumn(listItem: any, column: ListColumn): string {
        let value = listItem[column.fieldname];
        let lookupItems = (<SelectItem[]>column.lookUps).filter((lookup: SelectItem) => lookup.value == value);
        return lookupItems.length > 0 ? lookupItems[0].text : "";
    }

    public add() {
        this.logger.log("ListEditorComponent.onSubmitEditDialog");
        this.editDialog.show();
    }

    public delete(listItem: any) {
        this.logger.log("ListEditorComponent.delete");
        let id = this.getListItemId(listItem);
        this.messageBoxService.showDialog(`Ausgewählten Datensatz ${id} löschen?`, "Löschen")
            .then((dlgResult: DialogResult) => {
                if (dlgResult == DialogResult.OK) {
                    this.deleteItem(id);
                }
            });
    }

    private async deleteItem(id: any) {
        try {
            this.loadingIndicator.show();
            await this._webApiService.delete(id);
            this.logger.log("ListEditorComponent.delete/success");
            this.refresh();
        }
        catch (error) {
            this.loadingIndicator.hide();
            this.logger.log("ListEditorComponent.delete/error");
            this.logger.error(error);
            this.messageBoxService.errorDialog("Fehler beim Löschen", "Fehler");
        }
    }

    public edit(event: Event, listItem: any) {
        this.logger.log("ListEditorComponent.edit");
        this.editDialog.show(listItem);
    }

    private onSubmitEditDialog(editItem: any) {
        this.logger.log("ListEditorComponent.onSubmitEditDialog");
        if (this.getListItemId(editItem)) {
            this.updateItem(editItem);
        }
        else {
            this.insertItem(editItem);
        }
    }

    private async updateItem(editItem: any) {
        this.logger.log("ListEditorComponent.updateItem");
        try {
            await this._webApiService.update(editItem);
            this.logger.log("ListEditorComponent.updateItem / success");
            this.refresh(this.getListItemId(editItem));
            this.editDialog.hide();
        }
        catch (error) {
            this.logger.log("ListEditorComponent.updateItem / error");
            this.logger.error(error);
            this.messageBoxService.errorDialog("Fehler beim Speichern der Daten", "Fehler");
        }
    }

    private async insertItem(editItem: any) {
        this.logger.log("ListEditorComponent.insertItem");
        try {
            let newItemId: number = await this._webApiService.insert(editItem);
            this.logger.log("ListEditorComponent.insertItem / success");
            this.refresh(newItemId);
            this.editDialog.hide();
        }
        catch (error) {
            this.logger.log("ListEditorComponent.insertItem / error");
            this.logger.error(error);
            this.messageBoxService.showDialog("Fehler beim Anlegen des Datensatzes", "Fehler", MessageType.ERROR, MessageButtons.CLOSE);

        }
    }

    private focus(listItem: any) {
        let id = this.getListItemId(listItem);
        this.listDatasource.focus(id);
    }

    private isSelected(listItem: any): boolean {
        let id = this.getListItemId(listItem);
        return this.listDatasource.isSelected(id);
    }
}

export class ListColumn extends DialogField {
    hiddenInList?: boolean;
    hiddenInDialog?: boolean;
    width?: string;
}

