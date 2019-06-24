import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { LoggerService, ListEditorComponent, ListEditorWebApiService } from '../shared';

import { Subscription } from 'rxjs/Subscription';
import { MasterDataWebApiService } from './master-data-web-api.service';
import { CategoryDto } from './master-data-web-api.service';

@Component({
    selector: 'master-data-category',
    moduleId: module.id,
    template: '<swt-list-editor #listEditor></swt-list-editor>'
})
export class MasterDataCategoryComponent implements OnInit {

    constructor(
        masterDataWebApiService: MasterDataWebApiService
    ) {
        this.webApiService = masterDataWebApiService.categoryWebApiService;
    }
    private webApiService: ListEditorWebApiService<CategoryDto>;

    @ViewChild('listEditor') listEditor: ListEditorComponent;
    ngOnInit() {
        this.listEditor.columns = [
            { fieldname: "id", text: "ID" },
            { fieldname: "name", text: "Name", maxLength: 50 },
            { fieldname: "orderValue", text: "Reihenfolge", type: "number" }
        ];
        this.listEditor.webApiService = this.webApiService;
        this.listEditor.titleSingular = "Kategorie";
        this.listEditor.titlePlural = "Kategorien"
    }
}