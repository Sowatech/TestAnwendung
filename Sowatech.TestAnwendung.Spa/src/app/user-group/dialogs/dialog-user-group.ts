import { Injectable } from '@angular/core';
import { DialogField, IDialogConfiguration } from "../../shared";
import { TranslationService } from 'angular-l10n';

@Injectable()
export class DialogUserGroupService {
    constructor(private translation: TranslationService) { }

    public getDialogConfiguration(): IDialogConfiguration {
        let config: IDialogConfiguration = {
            title: this.translation.translate("USER_GROUP.DIALOG.TITLE"),
            fieldsOrCategoriesOfFields: this.getDialogFields()
        }
        return config;
    }
    
    private getDialogFields(): Array<DialogField> {
        let configFields: Array<DialogField> = [
            { text: this.translation.translate("USER_GROUP.DIALOG.NAME_FIELD_TEXT"), fieldname: "name", autofocus: true, required: true, maxLength: 50 },
            { text: this.translation.translate("USER_GROUP.DIALOG.COMMENT_FIELD_TEXT"), fieldname: "comment", type: "textarea" },
            { text: this.translation.translate("USER_GROUP.DIALOG.USERROLES_FIELD_TEXT"), fieldname: "userRoles", lookUps: "USERROLES", multiSelectLookups: true },
        ];
        return configFields;
    }
}
