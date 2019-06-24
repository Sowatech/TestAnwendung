import { Injectable } from '@angular/core';
import { GenericEditDialogService, DialogField, DialogFieldCategory } from "../../../shared";


@Injectable()
export class DialogUserProfileUpdateService {

    constructor(private service: GenericEditDialogService)
    { }

    public register() {
        let config: Array<DialogField> | Array<DialogFieldCategory> = this.getDialogConfiguration();
        this.service.registerDialogConfiguration("USER_PROFILE_UPDATE", config, "Benutzerprofil");
    }

    public getDialogConfiguration(): Array<DialogField> | Array<DialogFieldCategory> {
        return [
            { text: "Anzeigename", fieldname: "displayName", type: "text", maxLength: 50, required:true},
            { text: "Email", fieldname: "email", maxLength: 50, type: 'email', required: true }
        ];
    }
}
