import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';
import { Subscription } from 'rxjs/Subscription';

import {
    DatasourceComponent,
    GridColumnButtonEvent,
    GridComponent,
    LoggerService,
    MessageBoxService,
    Session,
} from '../shared';
import { UserCrudService, UserCrudSuccessResult } from './user-crud.service';
import { UserWebApiService } from './user-web-api.service';
import { UserDto } from './user.dtos';
import { UserModel } from './user.model';

@Component({
    selector: 'user-administration',
    templateUrl: './user-administration.component.html'
})
export class UserAdministrationComponent implements OnInit, OnDestroy {

    @Language() lang: string;
    @ViewChild('userDatasource') userDatasource: DatasourceComponent;
    @ViewChild('userListGrid') userListGrid: GridComponent;

    constructor(
        private logger: LoggerService,
        private userWebApiService: UserWebApiService,
        private messageBoxService: MessageBoxService,
        private sessionService: Session,
        private userCrudService: UserCrudService,
        private translation: TranslationService
    ) { }

    private subscriptions: Array<Subscription> = [];

    ngOnInit() {
        this.subscriptions.push(
            this.userListGrid.onButtonClicked.subscribe((event: GridColumnButtonEvent) => this.onGridButtonClicked(event)),
            this.userCrudService.onCrudSuccess.subscribe((result) => this.onCrudSuccess(result)),
            this.translation.translationChanged().subscribe(() => this.initGrid())
        );
        this.initGrid();
        this.refresh();
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) { s.unsubscribe(); }
    }

    private initGrid() {
        this.userListGrid.columns = [
            {
                fieldname: 'username', text: this.translation.translate("USER_LIST.GRID.USERNAME_FIELD_TEXT"), bodyClass: 'text-emphasized', spans:
                    [
                        { positionBefore: true, isIcon: true, class: "fa fa-user" }
                    ]
            },
            { fieldname: 'displayname', text: this.translation.translate("USER_LIST.GRID.DISPLAYNAME_FIELD_TEXT") },
            { fieldname: 'email', text: this.translation.translate("USER_LIST.GRID.EMAIL_FIELD_TEXT") },
            { fieldname: 'accessStart', text: this.translation.translate("USER_LIST.GRID.ACCESSSTART_FIELD_TEXT"), type: 'date' },
            { fieldname: 'accessEnd', text: this.translation.translate("USER_LIST.GRID.ACCESSEND_FIELD_TEXT"), type: 'date' },
            { fieldname: 'userGroupNames', text: this.translation.translate("USER_LIST.GRID.USERGROUPNAME_FIELD_TEXT") },
            {
                type: 'buttons', width: '280px',
                buttons: [
                    { text: this.translation.translate("USER_LIST.GRID.EDIT_BTN_TEXT"), tooltip: 'Benutzerdaten bearbeiten', buttonClass: 'btn-default btn-xs', iconClass: 'fa-edit', ident: 'EDIT' },
                    { text: this.translation.translate("USER_LIST.GRID.PWCHANGE_BTN_TEXT"), tooltip: 'Passwort ändern', buttonClass: 'btn-default btn-xs', iconClass: 'fa-lock', ident: 'SET_PASSWORD' },
                    { text: this.translation.translate("USER_LIST.GRID.DELETE_BTN_TEXT"), tooltip: 'Benutzer löschen', buttonClass: 'btn-danger btn-xs', iconClass: 'fa-trash', ident: 'DELETE' }
                ]
            }
        ];
    }

    userList: Array<UserModel> = [];

    private async refresh(focusedUsername?: string) {
        try {
            let dtos: Array<UserDto> = await this.userWebApiService.getUsers();
            this.logger.log("Liegensch");
            this.userList = dtos.map(dto => new UserModel(dto));
            if (focusedUsername) this.userDatasource.focus(focusedUsername);
            else this.userDatasource.clearSelection();
        }
        catch (error) {
            this.logger.error(error);
            this.messageBoxService.errorDialog(this.translation.translate("USER_LIST.MESSAGE_LOAD_ERROR"));

        }
    }

    private onGridButtonClicked(event: GridColumnButtonEvent) {
        let username = event.itemId;
        switch (event.buttonIdent) {
            case "EDIT":
                this.userCrudService.editUser(event.itemId);
                break;
            case "DELETE":
                if (this.sessionService.Data.userName != username)
                    this.userCrudService.deleteUserConfirmation(username + " löschen?", username);
                break;
            case "SET_PASSWORD":
                this.userCrudService.setPassword(username);
                break;
        }
    }

    createItem() {
        this.userCrudService.createUser();
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
