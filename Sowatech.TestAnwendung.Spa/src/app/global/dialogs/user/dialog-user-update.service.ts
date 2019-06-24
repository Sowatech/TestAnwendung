import { Injectable } from '@angular/core';
import { GenericEditDialogService, DialogField, DialogFieldCategory } from "../../../shared";


@Injectable()
export class DialogUserUpdateService {

    constructor(private service: GenericEditDialogService)
    { }

    public register() {
        let config: Array<DialogField> | Array<DialogFieldCategory> = this.getDialogConfiguration();
        this.service.registerDialogConfiguration("USER_UPDATE", config, "Benutzer");
    }

    public getDialogConfiguration(): Array<DialogField> | Array<DialogFieldCategory> {
        let config:Array<DialogField> =  [
            { text: "Anzeigename", fieldname: "displayName", type: "text", maxLength: 50},
            { text: "Email", fieldname: "email", maxLength: 50, type: 'email', required: true },
            { type: 'divider' },
            { text: 'Benutzergruppen', fieldname: 'userGroupIds', type: "number", lookUps: 'USER_GROUPS', multiSelectLookups: true },
            { text: 'Zugang ab', fieldname: 'accessStart', type: 'date' },
            { text: 'Zugang bis', fieldname: 'accessEnd', type: 'date' }
        ];
        return config;
    }
}
