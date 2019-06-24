import { Injectable } from '@angular/core';
import { GenericEditDialogService, DialogField, DialogFieldCategory } from "../../../shared";


@Injectable()
export class DialogUserChangePasswordService {

    constructor(private service: GenericEditDialogService)
    { }

    public register() {
        let config: Array<DialogField> | Array<DialogFieldCategory> = this.getDialogConfiguration();
        this.service.registerDialogConfiguration("USER_CHANGE_PASSWORD", config, "Kennwort ändern");
    }

    public getDialogConfiguration(): Array<DialogField> | Array<DialogFieldCategory> {
        return [
            { text: "Aktuelles Kennwort", fieldname: "currentPassword", type: "password", autofocus: true },
            { text: "Neues Kennwort", type: "divider"},
            { text: "Kennwort", fieldname: "newPassword", type: "password-with-confirm" },
        ];
    }
}
