import { Injectable } from '@angular/core';
import { GenericEditDialogService, DialogField, DialogFieldCategory } from "../../../shared";

@Injectable()
export class DialogClientAddService {

    constructor(private service: GenericEditDialogService)
    { }

    public register() {
        let config: Array<DialogField> | Array<DialogFieldCategory> = this.getDialogConfiguration();
        this.service.registerDialogConfiguration("CLIENT_ADD", config, "Mandant");
    }

    public getDialogConfiguration(): Array<DialogField> | Array<DialogFieldCategory> {
        let config: Array<DialogField> =  [
            { text: "Name", fieldname: "name", type: "text", autofocus: true, required: true, maxLength: 100, },
            { text: 'Zugang ab', fieldname: 'accessStart', type: 'date',default:null },
            { text: 'Zugang bis', fieldname: 'accessEnd', type: 'date', default: null },
            
            { type: 'divider', text: 'Administrator' },
            { text: "Benutzername", fieldname: "userName", type: "text", autofocus: true, required: true, maxLength: 50, },
            { text: "Anzeigename", fieldname: "displayName", type: "text", maxLength: 50, },
            { text: "Email", fieldname: "email", maxLength: 50, type: 'email', required: true },
            { type: 'divider' },
            { text: "Kennwort", fieldname: "Password", maxLength: 50, type: 'password-with-confirm', required: true },
        ];
        return config;
    }
}
