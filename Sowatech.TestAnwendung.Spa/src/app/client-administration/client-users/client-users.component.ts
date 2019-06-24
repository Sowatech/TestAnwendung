import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import {
    DatasourceComponent,
    GridColumnButtonEvent,
    GridComponent,
    LoggerService,
    MessageBoxService,
    Session,
} from '../../shared';
import { ClientWebApiService } from '../client-web-api.service';
import { CrudService, UserCrudSuccessResult } from './client-users-crud.service';
import { UserDto } from './client-users.dtos';
import { UserModel } from './client-users.model';

@Component({
    selector: 'client-users',
    moduleId: module.id,
    templateUrl: './client-users.component.html'
})
export class ClientUsersComponent implements OnInit, OnDestroy {
    @Input() clientId: number;
    @ViewChild('userDatasource') userDatasource: DatasourceComponent;
    @ViewChild('userListGrid') userListGrid: GridComponent;

    constructor(
        private logger: LoggerService,
        private userWebApiService: ClientWebApiService,
        private messageBoxService: MessageBoxService,
        private sessionService: Session,
        private userCrudService: CrudService
    ) { }

    private subscriptions: Array<Subscription> = [];

    ngOnInit() {
        this.initGrid();
        this.refresh();
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) { s.unsubscribe(); }
    }

    private initGrid() {
        this.userListGrid.columns = [
            { fieldname: 'username', text: 'Benutzername' },
            { fieldname: 'displayname', text: 'Anzeigename' },
            { fieldname: 'email', text: 'Email' },
            { fieldname: 'accessStart', text: 'Zugang ab', type: 'date' },
            { fieldname: 'accessEnd', text: 'Zugang bis', type: 'date' },
            { fieldname: 'userGroupName', text: 'Benutzergruppe' },
            {
                type: 'buttons',
                buttonsAsDropdown: 'Aktionen',
                buttons: [
                    { text: 'Bearbeiten', tooltip: 'Benutzerdaten bearbeiten', buttonClass: 'btn-default btn-xs', iconClass: 'fa-edit', ident: 'EDIT' },
                    { text: 'Passwort ändern', tooltip: 'Passwort ändern', buttonClass: 'btn-default btn-xs', iconClass: 'fa-lock', ident: 'SET_PASSWORD' },
                    { text: 'Löschen', tooltip: 'Benutzer löschen', buttonClass: 'btn-danger btn-xs', iconClass: 'fa-trash', ident: 'DELETE' }
                ]
            }
        ];
        this.subscriptions.push(
            this.userListGrid.onButtonClicked.subscribe((event: GridColumnButtonEvent) => this.onGridButtonClicked(event)),
            this.userCrudService.onCrudSuccess.subscribe((result) => this.onCrudSuccess(result))
        );
    }

    userList: Array<UserModel> = [];

    private async refresh(focusedUsername?: string) {
        this.logger.log("ClientUsersComponent.refresh");
        this.userListGrid.loadingIndicator.show();
        try {
            let dtos: Array<UserDto> = await this.userWebApiService.getUsers(this.clientId);
            this.logger.log("ClientUsersComponent.refresh/success");
            this.userList = dtos.map(dto => new UserModel(dto));
            this.userListGrid.loadingIndicator.hide();
            if (focusedUsername) {
                //problem: aufruf zu frueh fuer bestimmung pageindex; da in der datasource noch die alte datasource besteht
                setTimeout(() => this.userDatasource.focus(focusedUsername, true), 100);
            }
        }
        catch (error) {
            this.logger.error(error);
            this.messageBoxService.errorDialog("Fehler Laden der Daten vom Server");
            this.userListGrid.loadingIndicator.hide();
        }
    }

    onGridButtonClicked(event: GridColumnButtonEvent) {
        let username = event.itemId;
        switch (event.buttonIdent) {
            case "EDIT":
                this.userCrudService.editUser(username);
                break;
            case "DELETE":
                if (this.sessionService.Data.userName != username) {
                    this.userCrudService.deleteUserConfirmation("Administrator " + username + " löschen?", username);
                }
                else {
                    this.messageBoxService.infoDialog("Der aktuelle Benutzer kann sich nicht selbst löschen");
                }
                break;
            case "SET_PASSWORD":
                this.userCrudService.setPassword(username);
                break;
        }
    }

    createItem() {
        this.userCrudService.createUser(this.clientId);
    }

    private onCrudSuccess(result: UserCrudSuccessResult) {
        switch (result.mode) {
            case "UPDATE":
            case "CREATE":
            case "SET_PASSWORD":
                this.refresh(result.username);
                break;
            case "DELETE":
                this.refresh();
                break;
            default:
                this.logger.error("onCrudSuccess: Unhandled mode=" + result.mode);
                break;
        }
    }
}
