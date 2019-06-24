import { Injectable } from '@angular/core';
import { GenericEditDialogService, DialogField, DialogFieldCategory, IDialogConfiguration } from "../../../shared";


@Injectable()
export class DialogSmtpService {

    constructor(private service: GenericEditDialogService)
    { }

    public register() {
        let config = this.getDialogConfiguration();
        this.service.registerDialogConfiguration("SMTP_SETTINGS", config);
    }

    public getDialogConfiguration(): IDialogConfiguration {
        
        return {
            title: "SMTP Daten",
            fieldsOrCategoriesOfFields:[
                { fieldname: "serverUrl", text: "SMTP Server Url", maxLength: 50 },
                { fieldname: "username", text: "Username", maxLength: 50 },
                { fieldname: "email", text: "Email", type: "email", maxLength: 50 },
                { fieldname: "sslEnabled", text: "SSL", type: "boolean" },
                { fieldname: "password", text: "Passwort", type: "password", maxLength: 50 }    
            ]
        };
    }
}
