import { Injectable, EventEmitter } from '@angular/core';
import { LoggerService, MessageBoxService, GenericEditDialogService } from '../../shared';
import { AddUserDto, UpdateUserDto, SetPasswordParams, IdentityResultDto } from './client-users.dtos';
import { ClientWebApiService } from "../client-web-api.service";

//export namespace ClientUsers {
@Injectable()
export class CrudService {
    constructor(
        private logger: LoggerService,
        private webApiService: ClientWebApiService,
        private messageBoxService: MessageBoxService,
        private genericEditDialogService: GenericEditDialogService
    ) { }

    public onCrudSuccess = new EventEmitter<UserCrudSuccessResult>();

    public async createUser(clientId: number) {
        this.logger.log("UserCrudService.createUser");
        try {
            let dto: AddUserDto = await this.webApiService.getAddUser(clientId);
            this.showCreateUserDialog(dto);
        }
        catch (error) {
            this.serverLoadError(error);
        }
    }

    private showCreateUserDialog(dto: AddUserDto) {
        this.genericEditDialogService.show<AddUserDto, CrudModeType>("USER_ADD", dto, "CREATE", [{ key: "USER_GROUPS", lookupItems: dto.userGroupSelectItems }])
            .subscribe((dialogResult) => {
                this.onOkCreateUserDialog(dialogResult.dto);
            });
    }

    private async onOkCreateUserDialog(dto: AddUserDto) {
        try {
            let identityResultDto: IdentityResultDto = await this.webApiService.addUser(dto);
            if (identityResultDto.Succeeded) {
                this.logger.log("UserCrudService.onOkCreateUserDialog/Succeeded");
                this.onCrudSuccess.emit({ mode: "CREATE", username: dto.userName });
            }
            else {
                this.logger.log("UserCrudService.onOkCreateUserDialog/Failed");
                this.genericEditDialogService.showErrors(identityResultDto.Errors);
            }
        }
        catch (error) {
            this.serverSaveError(error);
        }
    }

    public async editUser(username: string) {
        this.logger.log("");
        try {
            let dto: UpdateUserDto = await this.webApiService.getUpdateUser(username);
            this.showUpdateUserDialog(dto);
        }
        catch (error) {
            this.serverLoadError(error);
        }
    }

    private showUpdateUserDialog(dto: UpdateUserDto) {
        this.genericEditDialogService.show<UpdateUserDto, CrudModeType>("USER_UPDATE", dto, "UPDATE", [{ key: "USER_GROUPS", lookupItems: dto.userGroupSelectItems }])
            .subscribe((dialogResult) => {
                this.onOkUpdateUserDialog(dialogResult.dto);
            });
    }

    private async onOkUpdateUserDialog(dto: UpdateUserDto) {
        try {
            await this.webApiService.updateUser(dto);
            this.logger.log("UserCrudService.onOkUpdateUserDialog/Succeeded");
            this.onCrudSuccess.emit({ mode: "UPDATE", username: dto.userName });
        }
        catch (error) {
            this.serverSaveError(error);
        }
    }

    public deleteUserConfirmation(confirmationText: string, username: string) {
        this.logger.log("");
        this.messageBoxService.confirmDialog(confirmationText)
            .then(() => { this.onOkDeleteUser(username); });
    }

    private async onOkDeleteUser(username: string) {
        this.logger.log("");
        try {
            await this.webApiService.deleteUser(username);
            this.logger.log("UserCrudService.onOkDeleteUser/Succeeded");
            this.onCrudSuccess.emit({ mode: "DELETE", username: username });
        }
        catch (error) {
            this.serverSaveError(error);
        }
    }

    public setPassword(username: string) {
        this.logger.log("");
        this.genericEditDialogService.show<SetPasswordParams, CrudModeType>("USER_SET_PASSWORD")
            .subscribe(
                (dialogResult) => {
                    dialogResult.dto.userName = username;
                    this.onOkSetPasswordDialog(dialogResult.dto);
                }
            );
    }

    private async onOkSetPasswordDialog(param: SetPasswordParams) {
        try {
            let identityResultDto: IdentityResultDto = await this.webApiService.setPassword(param);
            if (identityResultDto.Succeeded) {
                this.logger.log("UserCrudService.onOkSetPasswordDialog/Succeeded");
                this.onCrudSuccess.emit({ mode: "SET_PASSWORD", username: param.userName });
            }
            else {
                this.logger.log("UserCrudService.onOkSetPasswordDialog/Failed");
                this.genericEditDialogService.showErrors(identityResultDto.Errors);
            }
        }
        catch (error) {
            this.serverSaveError(error);
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

export type CrudModeType = "CREATE" | "UPDATE" | "DELETE" | "SET_PASSWORD";

export class UserCrudSuccessResult {
    mode: CrudModeType;
    username: string;
}