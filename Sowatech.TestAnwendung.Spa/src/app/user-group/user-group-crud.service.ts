import { Injectable, EventEmitter } from '@angular/core';
import { LoggerService, MessageBoxService, MessageType, MessageButtons } from '../shared';
import { EditUserGroupDtoBase, InsertUserGroupDto, UpdateUserGroupDto } from './user-group.dtos';
import { UserGroupWebApiService } from "./user-group-web-api.service";
import { GenericEditDialogService, GenericEditDialogResult, DialogDynamicList } from "../shared";

import { DialogUserGroupService } from "./dialogs/dialog-user-group";


@Injectable()
export class UserGroupCrudService {
    constructor(
        private logger: LoggerService,
        private wepApiService: UserGroupWebApiService,
        private messageBoxService: MessageBoxService,
        private genericEditDialogService: GenericEditDialogService,
        private dialogUserGroupService: DialogUserGroupService
    ) { }

    private availableUserRoles: SelectItem[] = [];
    public async loadAvailableUserRoles() {
        try {
            let roles = await this.wepApiService.getAvailableRoles();
            this.availableUserRoles = roles.map(
                (roleName) => {
                    return {
                        value: roleName,
                        text: roleName
                    }
                });
        }
        catch (error) {
            this.serverLoadError(error);
        }
    }

    public async createItem() {
        this.logger.log("UserGroupCrudService.createItem");
        try {
            let data = await this.wepApiService.getAdd();
            this.showEditItemDialog(data, "CREATE");
        }
        catch (error) {
            this.serverLoadError(error);
        }
    }

    public async editItem(itemId: number) {
        this.logger.log("UserGroupCrudService.editItem");
        try {
            let data = await this.wepApiService.getUpdate(itemId);
            this.showEditItemDialog(data, "UPDATE");
        }
        catch (error) {
            this.serverLoadError(error);
        }
    }

    public async duplicateItem(itemId: number) {
        this.logger.log("UserGroupCrudService.duplicateItem");
        try {
            let data = await this.wepApiService.getUpdate(itemId);
            data.name = "Kopie von " + data.name;
            this.showEditItemDialog(data, "DUPLICATE");
        }
        catch (error) {
            this.serverLoadError(error);
        }
    }

    private showEditItemDialog(data: EditUserGroupDtoBase, mode: EditModeType) {
        let config = this.dialogUserGroupService.getDialogConfiguration();
        let lookups: DialogDynamicList[] = [{ key: "USERROLES", lookupItems: this.availableUserRoles }];
        this.genericEditDialogService.show<EditUserGroupDtoBase, EditModeType>(config, data, mode, lookups)
            .subscribe((result) => {
                this.onEditDialogOkButton(result);
            });
    }

    private async onEditDialogOkButton(dialogResult: GenericEditDialogResult<EditUserGroupDtoBase, EditModeType>) {
        try {
            switch (dialogResult.mode) {
                case "CREATE":
                    let id = await this.wepApiService.add(<InsertUserGroupDto>dialogResult.dto);
                    this.logger.log("UserGroupCrudService.onEditDialogOkButton/" + dialogResult.mode + "/success");
                    this.onCrudSuccess.emit({ mode: dialogResult.mode, itemId: id });
                    break;
                case "UPDATE":
                    await this.wepApiService.update(<UpdateUserGroupDto>dialogResult.dto);
                    this.logger.log("UserGroupCrudService.onEditDialogOkButton/" + dialogResult.mode + "/success");
                    this.onCrudSuccess.emit({ mode: dialogResult.mode, itemId: (<UpdateUserGroupDto>dialogResult.dto).id });
                    break;
                case "DUPLICATE":
                    {
                        let id = await this.wepApiService.duplicate(<UpdateUserGroupDto>dialogResult.dto)
                        this.logger.log("UserGroupCrudService.onEditDialogOkButton/" + dialogResult.mode + "/success");
                        this.onCrudSuccess.emit({ mode: dialogResult.mode, itemId: id });
                    }
                    break;
                default:
                    this.logger.error("UserGroupCrudService.onEditDialogOkButton unhandled mode=" + dialogResult.mode);
                    break;
            }

        } catch (error) {
            this.serverSaveError(error);
        }
    }

    public onCrudSuccess = new EventEmitter<CrudSuccessResult>();


    public deleteItemConfirmation(itemId: number, itemName: string) {
        this.logger.log("UserGroupCrudService.deleteItemConfirmation");
        this.messageBoxService.confirmDialog(ENTITY_SINGULAR + ` "${itemName}" löschen?`, "Löschen")
            .then(() => { this.deleteItem(itemId); });
    }

    private async deleteItem(itemId: number) {
        this.logger.log("UserGroupCrudService.deleteItem");
        try {
            await this.wepApiService.delete(itemId)
            this.logger.log("UserGroupCrudService.deleteItem/success");
            this.onCrudSuccess.emit({ mode: "DELETE", itemId: itemId });
        } catch (error) { this.serverSaveError(error) };
    }

    private serverLoadError(error) {
        this.logger.error(error);
        this.messageBoxService.showDialog("Fehler beim Laden der Daten vom Server", "Fehler", MessageType.ERROR, MessageButtons.CLOSE);
    }

    private serverSaveError(error) {
        this.logger.error(error);
        this.messageBoxService.showDialog("Fehler beim Speichern der Daten auf dem Server", "Fehler", MessageType.ERROR, MessageButtons.CLOSE);
    }
}

const ENTITY_SINGULAR = "Benutzergruppe";

export type EditModeType = "CREATE" | "UPDATE" | "DUPLICATE";
export type CrudModeType = EditModeType | "DELETE";

export class CrudSuccessResult {
    mode: CrudModeType;
    itemId: number;
}

