import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Language, TranslationService } from 'angular-l10n';
import { Subscription } from 'rxjs/Subscription';

import { DatasourceComponent, GridColumnButtonEvent, GridComponent, LoggerService, MessageBoxService } from '../../shared';
import { ClientCrudService, CrudSuccessResult } from '../client-crud.service';
import { ClientWebApiService } from '../client-web-api.service';
import { ClientListModel } from './client-list.model';


@Component({
    selector: 'client-liste',
    moduleId: module.id,
    templateUrl: './client-list.component.html'
})

export class ClientListComponent implements OnInit, OnDestroy {
    @ViewChild('clientDatasource') clientDatasource: DatasourceComponent;
    @ViewChild('clientGrid') clientGrid: GridComponent;

    constructor(
        public translation: TranslationService,
        private logger: LoggerService,
        private webApiService: ClientWebApiService,
        private crudService: ClientCrudService,
        private messageBoxService: MessageBoxService,
        private router: Router
    ) {
    }



    @Language() lang: string;
    private subscriptions = new Array<Subscription>();

    ngOnInit() {

        this.initGrid();
        this.subscriptions.push(
            //this.clientDatasource.onFocusedIdChanges.subscribe((focusedId: any) => { }),
            this.crudService.onCrudSuccess.subscribe((result) => { this.onCrudSuccess(result) })
        );
        this.loadList();
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    private initGrid() {
        this.clientGrid.columns = [
            {
                fieldname: "name", text: "Name",
                spans: [
                    { isIcon: true, class: "fa fa-institution", positionBefore: true }
                ]
            },
            { fieldname: "accessStart", text: "Zugang ab", type: "date" },
            { fieldname: "accessEnd", text: "Zugang bis", type: "date" },
            {
                type: "buttons", width: "50px",
                buttons: [
                    { text: "Detail", ident: "DETAIL", tooltip: "Detail", buttonClass: "btn-link", iconClass: "fa-caret-right" }
                ]
            }
        ];
        this.clientGrid.onButtonClicked.subscribe(($event) => this.onGridButtonClicked($event));
    }

    clients: ClientListModel[] = [];

    private async loadList(selectId?: number) {
        this.clientGrid.loadingIndicator.show();
        try {
            let dto = await this.webApiService.getList();
            this.clientGrid.loadingIndicator.hide();
            this.logger.log("ClientListComponent.loadList/success");
            this.clients = dto.map(dto => new ClientListModel(dto));
            if (selectId) {
                //problem: aufruf zu frueh fuer bestimmung pageindex; da in der datasource noch die alte datasource besteht
                setTimeout(() => this.clientDatasource.focus(selectId, true), 100);
            }
            this.clientGrid.loadingIndicator.hide();
        }
        catch (error) {
            this.serverLoadError(error);
            this.clientGrid.loadingIndicator.hide();
        }
    }

    navigateToDetail(clientId: number) {
        if (clientId) this.router.navigate(['/mandant', clientId]);
    }

    private onGridButtonClicked(event: GridColumnButtonEvent) {
        this.clientDatasource.focus(event.itemId);
        this.navigateToDetail(event.itemId);
    }

    editItem(item: ClientListModel) {
        this.crudService.editItem(item.id);
    }

    createItem() {
        this.crudService.createItem();
    }

    deleteItem(item: ClientListModel) {
        this.crudService.deleteItemConfirmation(item.id, item.name);
    }

    private onCrudSuccess(result: CrudSuccessResult) {
        switch (result.mode) {
            default:
                this.loadList(result.itemId);
                break;
            case "CREATE":
                this.clientDatasource.focus(result.itemId);
                this.navigateToDetail(result.itemId);
                break;
            case "DELETE":
                this.clientDatasource.clearSelection();
                this.loadList();
                break;
        }
    }

    private serverLoadError(error) {
        this.logger.error(error);
        this.messageBoxService.errorDialog("Fehler beim Laden der Daten vom Server", "Fehler");
    }

    private serverSaveError(error) {
        this.logger.error(error);
        this.messageBoxService.errorDialog("Fehler beim Speichern der Daten auf dem Server", "Fehler");
    }

}
