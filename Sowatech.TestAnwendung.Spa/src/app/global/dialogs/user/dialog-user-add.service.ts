import { Injectable } from '@angular/core';
import { GenericEditDialogService, DialogField, DialogFieldCategory } from "../../../shared";


@Injectable()
export class DialogUserAddService {

    constructor(private service: GenericEditDialogService)
    { }

    public register() {
        let config: Array<DialogField> | Array<DialogFieldCategory> = this.getDialogConfiguration();
        this.service.registerDialogConfiguration("USER_ADD", config, "Neuer Benutzer");
    }

    public getDialogConfiguration(): Array<DialogField> | Array<DialogFieldCategory> {
        return [
            { text: "Benutzername", fieldname: "userName", type: "text", autofocus: true, required: true, maxLength: 50, },
            { text: "Anzeigename", fieldname: "displayName", type: "text", maxLength: 50, },
            { text: "Email", fieldname: "email", maxLength: 50, type: 'email', required: true },
            { type: 'divider' },
            { text: "Kennwort", fieldname: "Password", maxLength: 50, type: 'password-with-confirm', required: true },
            { type: 'divider' },
            { text: 'Benutzergruppen', fieldname: 'userGroupIds', lookUps: 'USER_GROUPS', type: "number", multiSelectLookups: true },
            { text: 'Zugang ab', fieldname: 'accessStart', type: 'date' },
            { text: 'Zugang bis', fieldname: 'accessEnd', type: 'date' }
        ];
    }
}
