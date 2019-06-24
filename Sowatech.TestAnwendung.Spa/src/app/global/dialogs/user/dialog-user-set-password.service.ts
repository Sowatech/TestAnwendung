import { Injectable } from '@angular/core';
import { GenericEditDialogService, DialogField, DialogFieldCategory } from "../../../shared";


@Injectable()
export class DialogUserSetPasswordService {

    constructor(private service: GenericEditDialogService)
    { }

    public register() {
        let config: Array<DialogField> | Array<DialogFieldCategory> = this.getDialogConfiguration();
        this.service.registerDialogConfiguration("USER_SET_PASSWORD", config, "Passwort setzen");
    }

    public getDialogConfiguration(): Array<DialogField> | Array<DialogFieldCategory> {
        return [
            { text: "Neues Kennwort", fieldname: "Password", type: "password-with-confirm", autofocus: true },
        ];
    }
}
