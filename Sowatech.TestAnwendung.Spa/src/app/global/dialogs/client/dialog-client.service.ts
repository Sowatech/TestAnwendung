import { Injectable } from '@angular/core';
import { GenericEditDialogService, DialogField, DialogFieldCategory } from "../../../shared";


@Injectable()
export class DialogClientService {

    constructor(private service: GenericEditDialogService)
    { }

    public register() {
        let config: Array<DialogField> | Array<DialogFieldCategory> = this.getDialogConfiguration();
        this.service.registerDialogConfiguration("CLIENT", config, "Mandant");
    }

    public getDialogConfiguration(): Array<DialogField> | Array<DialogFieldCategory> {
        let config: Array<DialogField> =  [
            { text: "Name", fieldname: "name", type: "text", autofocus: true, required: true, maxLength: 100, },
            { text: 'Zugang ab', fieldname: 'accessStart', type: 'date',default:null },
            { text: 'Zugang bis', fieldname: 'accessEnd', type: 'date', default: null }
        ];
        return config;
    }
}
