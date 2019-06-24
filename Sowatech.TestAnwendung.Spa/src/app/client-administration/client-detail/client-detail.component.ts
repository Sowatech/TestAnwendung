import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { NavService } from '../../nav';
import { LoggerService, MessageBoxService } from '../../shared';
import { ClientCrudService, CrudSuccessResult } from '../client-crud.service';
import { ClientWebApiService } from '../client-web-api.service';
import { ClientDetailModel } from './client-detail.model';


@Component({
    selector: 'client-detail',
    templateUrl: './client-detail.component.html'
})

export class ClientDetailComponent implements OnInit, OnDestroy {

    constructor(
        private messageBoxService: MessageBoxService,
        private logger: LoggerService,
        private router: Router,
        private route: ActivatedRoute,
        private wepApiService: ClientWebApiService,
        private clientCrudService: ClientCrudService,
        private navService: NavService
    ) {

    }

    model: ClientDetailModel;
    private subscriptions: Array<Subscription> = [];

    ngOnInit() {
        this.subscriptions.push(
            this.route.params.subscribe(
                (params) => {
                    let id = +params['id'];
                    this.load(id);
                }
            ),
            this.clientCrudService.onCrudSuccess.subscribe(
                (result) => {
                    this.onCrudSuccess(result)
                }
            )
        );
    }

    ngOnDestroy() {
        for (let subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    public async load(id: number) {
        this.logger.log("ClientDetailComponent.load")
        try {
            let dto = await this.wepApiService.getDetail(id);
            this.logger.log("ClientDetailComponent.load/success");
            this.model = new ClientDetailModel(dto);
            this.navService.setCustomNavTitle(this.model.name);
        }
        catch (error) {
            this.serverLoadError(error);
        }
    }

    public createItem() {
        this.logger.log("ClientDetailComponent.createItem");
        this.clientCrudService.createItem();
    }

    public editItem() {
        this.logger.log("ClientDetailComponent.editItem");
        this.clientCrudService.editItem(this.model.id);
    }

    public navigateToList() {
        this.router.navigate(['/mandanten']);
    }

    public navigateToDetail(id: number) {
        this.router.navigate(['/mandant', id]);
    }

    public deleteItem() {
        this.logger.log("ClientDetailComponent.deleteItem");
        this.clientCrudService.deleteItemConfirmation(this.model.id, this.model.name);
    }

    private onCrudSuccess(result: CrudSuccessResult) {
        switch (result.mode) {
            case "UPDATE":
                this.load(this.model.id);
                break;
            case "CREATE":
                this.navigateToDetail(result.itemId);
                break;
            case "DELETE":
                this.navigateToList();
                break;
            default:
                this.logger.error("onCrudSuccess: Unhandled mode=" + result.mode);
                break;
        }
    }

    private serverLoadError(error) {
        this.logger.error(error);
        this.messageBoxService.errorDialog("Fehler beim Laden der Daten vom Server");
    }

    private serverSaveError(error) {
        this.logger.error(error);
        this.messageBoxService.errorDialog("Fehler beim Speichern der Daten auf dem Server");
    }
}