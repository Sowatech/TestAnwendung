import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';
import { Subscription } from 'rxjs/Subscription';

import { DatasourceComponent, GridColumnButtonEvent, GridComponent, LoggerService, MessageBoxService } from '../shared';
import { CrudSuccessResult, UserGroupCrudService } from './user-group-crud.service';
import { UserGroupWebApiService } from './user-group-web-api.service';
import { UserGroupModel } from './user-group.models';

@Component({
    selector: 'user-group',
    templateUrl: './user-group.component.html'
})
export class UserGroupComponent implements OnInit, OnDestroy {
    constructor(
        private logger: LoggerService,
        private messageBoxService: MessageBoxService,
        private webApiService: UserGroupWebApiService,
        private crudService: UserGroupCrudService,
        private translate: TranslationService
    ) {
    }

    private subscriptions = new Array<Subscription>();

    @Language() lang: string;
    async ngOnInit() {
        this.initGrid();
        this.subscriptions.push(
            this.crudService.onCrudSuccess.subscribe((result) => { this.onCrudSuccess(result) }),
            this.userGroupGrid.onButtonClicked.subscribe(($event) => this.onGridButtonClicked($event)),
            this.translate.translationChanged().subscribe(() => this.initGrid())
        );
        await this.crudService.loadAvailableUserRoles();
        await this.loadList();
    }

    ngOnDestroy() {
        for (var s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    @ViewChild('userGroupGrid') userGroupGrid: GridComponent;
    @ViewChild('userGroupDatasource') userGroupDatasource: DatasourceComponent;

    private initGrid() {
        this.userGroupGrid.columns = [
            {
                fieldname: "name", text: this.translate.translate("USER_GROUP.GRID.NAME_FIELD_TEXT"), width: "200px", bodyClass: "text-emphasized",
                spans: [{ isIcon: true, class: "fa fa-users", positionBefore: true }]
            },
            { fieldname: "comment", text: this.translate.translate("USER_GROUP.GRID.COMMENT_FIELD_TEXT") },
            { fieldname: "rolesCommaList", text: this.translate.translate("USER_GROUP.GRID.ROLESCOMMALIST_FIELD_TEXT") },
            {
                type: "buttons", width: "260px",
                buttons: [
                    { ident: "UPDATE", text: this.translate.translate("USER_GROUP.GRID.UPDATE_BTN_TEXT"), tooltip: "Bearbeiten", buttonClass: "btn-default", iconClass: "fa-edit" },
                    { ident: "DUPLICATE", text: this.translate.translate("USER_GROUP.GRID.DUPLICATE_BTN_TEXT"), tooltip: "Duplizieren", buttonClass: "btn-default", iconClass: "fa-copy" },
                    { ident: "DELETE", text: this.translate.translate("USER_GROUP.GRID.DELETE_BTN_TEXT"), tooltip: "Löschen", buttonClass: "btn-danger", iconClass: "fa-trash" },
                ]
            }
        ];
    }

    userGroups: UserGroupModel[] = [];

    private async loadList(selectId?: number) {
        this.userGroupGrid.loadingIndicator.show();
        try {
            let dto = await this.webApiService.getUserGroups();
            this.userGroupGrid.loadingIndicator.hide();
            this.logger.log("UserGroupComponent.loadList/success");
            this.userGroups = dto.map(dto => new UserGroupModel(dto));
            if (selectId) {
                this.userGroupDatasource.focusAfterRefresh(selectId);
            }
            this.userGroupGrid.loadingIndicator.hide();
        }
        catch (error) {
            this.serverLoadError(error);
            this.userGroupGrid.loadingIndicator.hide();
        }
    }


    createItem() {
        this.crudService.createItem();
    }

    private onGridButtonClicked(event: GridColumnButtonEvent) {
        switch (event.buttonIdent) {
            case "UPDATE":
                this.crudService.editItem(event.itemId);
                break;
            case "DUPLICATE":
                this.crudService.duplicateItem(event.itemId);
                break;
            case "DELETE":
                let item: UserGroupModel = this.userGroupDatasource.getDataItem(event.itemId);
                this.crudService.deleteItemConfirmation(event.itemId, item.name);
                break;
            default:
                this.logger.error("UserGroupListComponent onGridButtonClicked " + event.buttonIdent + " not implemented");
                break;
        }
    }

    private onCrudSuccess(result: CrudSuccessResult) {
        switch (result.mode) {
            default:
                this.loadList(result.itemId);
                break;
            case "DELETE":
                this.userGroupDatasource.clearSelection();
                this.loadList();
                break;
        }
    }

    private serverLoadError(error) {
        this.logger.error(error);
        this.messageBoxService.errorDialog(this.translate.translate("USER_GROUP.MESSAGE_BOX.LOAD_ERROR_TEXT"), this.translate.translate("USER_GROUP.MESSAGE_BOX.LOAD_ERROR_TITLE"));
    }

    private serverSaveError(error) {
        this.logger.error(error);
        this.messageBoxService.errorDialog(this.translate.translate("USER_GROUP.MESSAGE_BOX.SAVE_ERROR_TEXT"), this.translate.translate("USER_GROUP.MESSAGE_BOX.SAVE_ERROR_TITLE"));
    }
}
