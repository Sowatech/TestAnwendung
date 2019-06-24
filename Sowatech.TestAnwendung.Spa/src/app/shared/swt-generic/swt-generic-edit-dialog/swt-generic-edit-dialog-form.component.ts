import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Language, TranslationService } from 'angular-l10n';
import { IOption } from 'ng-select';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../../utilities';
import { GenericEditDialogComponent } from './swt-generic-edit-dialog.component';
import { DialogDynamicList, DialogField, DialogFieldButton, DialogFieldCategory } from './swt-generic-edit-dialog.types';

import * as moment from 'moment';

@Component({
    selector: 'swt-generic-edit-dialog-form',
    moduleId: module.id,
    templateUrl: './swt-generic-edit-dialog-form.component.html',
    //    changeDetection: ChangeDetectionStrategy.OnPush //https://angular-2-training-book.rangle.io/handout/change-detection/change_detection_strategy_onpush.html
})

export class GenericEditDialogFormComponent implements OnInit, OnDestroy, AfterViewChecked {

    constructor(
        private logger: LoggerService,
        translation: TranslationService,
        public changeDetectorRef: ChangeDetectorRef
    ) {
    }

    @Language() lang: string;
    private subscriptions = new Array<Subscription>();
    ngOnInit() {
        this.subscriptions.push(
            this.dialogForm.valueChanges.subscribe((data) => { this.onFormValueChanged(data) })
        );
        setTimeout(() => { this.refreshDialog() }, 300);//workaround: ohne diesen timeout/refresh werden die formErrors tlw. erst nach neuem digest zyklus angezeigt
    }

    ngAfterViewChecked() {
    }

    ngOnDestroy() {
        this.logger.log("ngOnDestroy");
        for (var s of this.subscriptions) {
            s.unsubscribe();
        }
        this.ngSelectOptionsDictionary = {};
    }

    @Input() master: GenericEditDialogComponent<any>;
    @Input() cat: DialogFieldCategory;
    @Input() editItem: any = {};//dialog copy of edited item
    @Input() dynamicLookups: DialogDynamicList[];
    private passwordConfirmInvalid(field: DialogField): boolean {
        return this.editItem[field.fieldname] != this.editItem[field.fieldnamePasswordConfirm];
    }

    private fieldVisible(field: DialogField): boolean {
        let isHidden = <boolean>(field["hideIf"] != undefined && field.hideIf(this.editItem));
        return !isHidden;
    }

    public getLookups(field: DialogField): Array<SelectItem> {
        return this.master.getLookups(field);
    }

    private ngSelectOptionsDictionary: any = {};
    public getLookupsWithLabel(field: DialogField): Array<IOption> {
        if (!this.ngSelectOptionsDictionary[field.fieldname]) {
            this.ngSelectOptionsDictionary[field.fieldname] =
                this.master.getLookups(field)
                    .map((item) => {
                        return {
                            value: item.value,
                            label: item.text
                        }
                    });
        }
        return this.ngSelectOptionsDictionary[field.fieldname];
    }

    private onSelectedChanged($event: IOption) {

    }

    public hasLookups(field: DialogField): boolean {
        return this.master.hasLookups(field);
    }

    private clearClicked(field: DialogField) {
        this.editItem[field.fieldname] = null;
    }
    
    public getDynamicDatasource(field: DialogField) {
        return this.master.getDynamicDatasource(field);
    }

    public refreshDialog() {
        this.changeDetectorRef.markForCheck();
    }

    @ViewChild('dialogForm') dialogForm: NgForm;
    
    private onFormValueChanged(data?: any) {
        this.formValidate(data);
    }

    formErrors = {};

    public formValidate(data?: any) {
        if (!this.master.dialog.isShown) return;
        if (!data) data = this.editItem;

        for (let field of this.cat.dialogFields.filter(f => f.fieldname)) {

            this.formErrors[field.fieldname] = '';
            let control = this.dialogForm.form.get(field.fieldname);

            if (control) {
                //custom validation
                switch (field.type) {
                    case "number":
                        if (field.min != null && (control.dirty && data[field.fieldname] == null || data[field.fieldname] < field.min)) {
                            control.setErrors({ "minInvalid": true });
                        }
                        if (field.max != null && (control.dirty && data[field.fieldname] == null || data[field.fieldname] > field.max)) {
                            control.setErrors({ "maxInvalid": true });
                        }
                        break;
                    case "date":
                        let dateFormat = this.master.lang.startsWith("en") ? "MM/DD/YYYY" : "DD.MM.YYYY";
                        let aMoment = moment(data[field.fieldname], dateFormat, true);
                        if (!aMoment.isValid()) {
                            control.setErrors({ "dateInvalid": true });
                        }
                        break;
                }

                let editItemHasValue = data[field.fieldname] != null && data[field.fieldname] != "";
                if ((control.dirty || editItemHasValue) && !control.valid) {

                    for (let key in control.errors) {
                        switch (key) {
                            case "maxInvalid":
                                this.formErrors[field.fieldname] += "Wert ist größer als das Maximum " + field.max + ' ';
                                break;
                            case "minInvalid":
                                this.formErrors[field.fieldname] += "Wert ist kleiner als das Minimum " + field.min + ' ';
                                break;
                            case "required":
                                this.formErrors[field.fieldname] += "Eingabe ist erforderlich" + ' ';
                                break;
                            case "dateInvalid":
                                this.formErrors[field.fieldname] += "Kein gültiges Datum" + ' ';
                                break;
                            default:
                                this.formErrors[field.fieldname] += key + ' ';
                                break;
                        }

                    }
                }
            }
        }
    }

    containsFormButtons(field: DialogField): boolean {
        let existingBtn = field.buttons && field.buttons.find(btn => !btn.position || btn.position == "form");
        return existingBtn ? true : false;
    }

    formButtons(field: DialogField): DialogFieldButton[] {
        return field.buttons ? field.buttons.filter(btn => !btn.position || btn.position == "form") : [];
    }

    onButtonClicked(btn: DialogFieldButton, editItem: any) {
        this.master.onButtonClicked(btn, editItem);
    }
}
