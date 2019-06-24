import {
    Component,
    EventEmitter,
    Input,
    KeyValueChangeRecord,
    KeyValueDiffer,
    KeyValueDiffers,
    Output,
    ViewChild
} from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';

import { DatasourceComponent } from '../../ds-datasource';
import { LoggerService } from '../../utilities';
import { DialogSize, GenericEditDialogService } from './swt-generic-edit-dialog.service';
import {
    ControlType,
    DIALOG_FIELD_NULLVALUE,
    DialogDynamicList,
    DialogField,
    DialogFieldButton,
    DialogFieldCategory
} from './swt-generic-edit-dialog.types';

@Component({
    selector: 'swt-generic-edit-dialog',
    templateUrl: './swt-generic-edit-dialog.component.html',
	styles: ['.modal-footer button { margin-left:3px;}']
})

export class GenericEditDialogComponent<T> {

    constructor(
        private logger: LoggerService,
        public translation: TranslationService,
        private genericEditDialogService: GenericEditDialogService,
        private differs: KeyValueDiffers
    ) {
    }


    private differ: KeyValueDiffer<any, any>;
    subscriptions: Array<Subscription> = [];

    ngOnInit() {
        this.subscriptions.push(
            this.translation.translationChanged().subscribe(
                (lang) => this.setTranslationProps()
            )
        )
        this.setTranslationProps();
    }

    ngOnDestroy() {
        this.logger.log("ngOnDestroy");
        for (var s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    @Language() lang: string;
    setTranslationProps() {
        setTimeout(() => {
            this.buttonOkText = this.getTranslations("SWT_GENERIC_EDIT_DIALOG.OK_BTN_TEXT");
            this.buttonCancelText = this.getTranslations("SWT_GENERIC_EDIT_DIALOG.CANCEL_BTN_TEXT");
      }, 100);
    }

    public languageIso: string;
    public buttonOkText: string;
    public buttonCancelText: string;

    getTranslations(key: string) {
        let result: string = "";
        let transtext: string = "";
        let transDefault = "No key";
        switch (key) {
            case "SWT_GENERIC_EDIT_DIALOG.CANCEL_BTN_TEXT":
                transtext = this.translation.translate("SWT_GENERIC_EDIT_DIALOG.CANCEL_BTN_TEXT");
                result = transtext == transDefault ? "Abbrechen" : transtext;
                break;
            case "SWT_GENERIC_EDIT_DIALOG.OK_BTN_TEXT":
                transtext = this.translation.translate("SWT_GENERIC_EDIT_DIALOG.OK_BTN_TEXT");
                result = transtext == transDefault ? "OK" : transtext;
                break;
        }
        return result;
    }

    ngDoCheck() {
        if (this.differ) {
            let changeDetected = this.differ.diff(this.editItem);
            if (changeDetected) {
                changeDetected.forEachChangedItem(
                    (keyValueChange) => {
                        this.doOnChange(keyValueChange);
                    }
                )
            }
        }
    }

    public configureDialogFields(fieldsOrCategoriesOfFields: DialogField[] | DialogFieldCategory[]) {
        this.categories = [];
        if (fieldsOrCategoriesOfFields && fieldsOrCategoriesOfFields.length > 0) {
            let firstFieldOrCategory = fieldsOrCategoriesOfFields[0];
            let argIsCategoryArray = <boolean>firstFieldOrCategory["dialogFields"];
            if (argIsCategoryArray) {
                this.categories = <DialogFieldCategory[]>fieldsOrCategoriesOfFields;
                for (let cat of this.categories) {
                    cat.dialogFields = this.prepareDialogFields(cat.dialogFields);
                }
            }
            else {
                let dialogFields = <DialogField[]>fieldsOrCategoriesOfFields;
                let dummyCategory: DialogFieldCategory = { name: "", dialogFields: [] };
                this.categories.push(dummyCategory);
                dummyCategory.dialogFields = this.prepareDialogFields(dialogFields);
            }
        }

        let notSupportedForMask = this.getAllDialogFields.filter(f => f.textMask != null && (f.type == "number" || f.type == "email"));
        if (notSupportedForMask && notSupportedForMask.length > 0) {
            this.logger.error("dialog field textMask not supported for type=number or type=email");
        }
    }

    public get getAllDialogFields(): DialogField[] {
        let allDialogFields = [];
        for (var cat of this.categories) {
            for (var fields of cat.dialogFields) {
                allDialogFields.push(fields);
            }
        }
        return allDialogFields;
    }

    private getDialogField(fieldname: string): DialogField {
        return this.getAllDialogFields.find((df) => { return df.fieldname == fieldname });
    }

    public categories: DialogFieldCategory[] = [];
    public get visibleCategories(): DialogFieldCategory[] {
        return this.categories.filter((cat) => cat["hideIf"] == undefined || !cat.hideIf(this.editItem));
    }

    //--- Custom Buttons
    public get customFormButtonsBefore(): Array<DialogFieldButton> {
        return this.getCustomButtons("footer-before");
    }

    public get customFormButtonsAfter(): Array<DialogFieldButton> {
        return this.getCustomButtons("footer-after");
    }

    private getCustomButtons(btnPosition: "footer-before" | "footer-after"): Array<DialogFieldButton> {
        let resultBtns = new Array<DialogFieldButton>();
        let dialogFieldsWithButtons = this.getAllDialogFields.filter(df => df.type == 'buttons');
        for (let df of dialogFieldsWithButtons) {
            for (let btn of df.buttons) {
                if (btn.position == btnPosition) {
                    resultBtns.push(btn);
                }
            }
        }
        return resultBtns;
    }

    public submitResult: "CANCEL" | "OK" | string;
    //---

    @Input() titleSingular: string = "";
    @Input() categoriesAsTabs: boolean = false;
    @Output() onSubmit = new EventEmitter<T>();
    @Output() onBeforeSubmit = new EventEmitter<T>();
    @Input() set serviceDialog(value: boolean) {//set this true, if this dialog component should be used as the "global generic dialog"
        if (value) {
            this.genericEditDialogService.setDialogComponent(this);
        }
    }

    private _size: DialogSize;
    public sizeClass: string = "modal-md";

    get size(): DialogSize {
        return this._size;
    }

    set size(newSize: DialogSize) {
        switch (newSize) {
            case "small":
                this.sizeClass = "modal-sm";
                break;
            case "medium":
                this.sizeClass = "modal-md";
                break;
            case "large":
                this.sizeClass = "modal-lg";
                break;
        }

        this._size = newSize;
    }

    @ViewChild('dialog') dialog: ModalDirective;
    modalTitle: string = "";

    private dtoItem: T;//original item
    private editItem: any = {};//dialog "copy" of dtoItem. this is similiar but not identical, e.g. it contains no lookups and no sub-objects
    public mode: any;
    public errorText: string;
    private dynamicLists?: DialogDynamicList[];

    public show(
        dto?: T,
        mode?: any,                 //user-defined 'mode' without any logic in dialog. can e.g. be used to store meta-info like "INSERT|EDIT|DUPLICATE" in multi-role dialogs
        dynamicLists?: DialogDynamicList[]    //dynamic lookups (in contrary to static) which are loaded before dialog.show. they are refernced by a lookupKey in the configuration (lookups of type string)
    ) {
        this.submitResult = "";
        this.mode = mode;
        this.dynamicLists = dynamicLists;

        this.errorText = "";
        this.dtoItem = dto;
        this.logger.log("GenericEditDialogComponent.show");
        if (dto) {
            this.copyToEditItem(dto);
        }
        else {
            this.initNewEditItem();
        }

        this.prepareItem();
        this.differ = this.differs.find(this.editItem).create();

        this.modalTitle = this.titleSingular;
        this.setFirstCatActive();
        this.dialog.show();
    }

    public showErrors(errors: string[]) {
        this.errorText = errors.join(", ");
        this.dialog.show();
    }

    private copyToEditItem(dto: T) {
        this.editItem = {};
        for (let field of this.getAllDialogFields.filter(f => f.fieldname)) {
            this.editItem[field.fieldname] = this.getValueOfDtoItem(field.fieldname);

            if (field.lookUps) {
                if (this.editItem[field.fieldname] == null) {
                    this.editItem[field.fieldname] = DIALOG_FIELD_NULLVALUE;
                }
                else if (field.type == "number") {
                    //dirty hack: fuer edit in string umwandeln
                    this.numberToStringEditItem(field);
                }
            }

            if (field.type == "password-with-confirm") {
                this.editItem[field.fieldnamePasswordConfirm] = this.editItem[field.fieldname];
            }
        }
    }

    private numberToStringEditItem(field: DialogField) {
        if (Array.isArray(this.editItem[field.fieldname])) {
            this.editItem[field.fieldname] = this.editItem[field.fieldname].map(numberValue => "" + numberValue);
        }
        else {
            this.editItem[field.fieldname] = "" + this.editItem[field.fieldname];
        }
    }

    private stringToNumberEditItem(field: DialogField) {
        if (Array.isArray(this.editItem[field.fieldname])) {
            this.editItem[field.fieldname] = this.editItem[field.fieldname].map(stringValue => parseFloat(stringValue));
        }
        else {
            this.editItem[field.fieldname] = parseFloat(this.editItem[field.fieldname]);
        }
    }

    private getValueOfDtoItem(fieldname: string): any {
        let value = null;
        if (fieldname) {
            let fieldParts = fieldname.split(".");
            value = this.dtoItem[fieldParts[0]];
            for (let i = 1; i < fieldParts.length; i++) {
                try {
                    value = value[fieldParts[i]];
                }
                catch (e) {
                    this.logger.error("GenericEditDialogComponent: error in accessing part " + fieldParts[i] + " of fieldname: " + fieldname);
                }
            }
        }
        return value;
    }

    private initNewEditItem() {
        this.editItem = {};
        for (let field of this.getAllDialogFields.filter(f => f.fieldname)) {
            if (field.default !== undefined) {
                this.editItem[field.fieldname] = field.default;
            }
            else if (this.getLookups(field.fieldname).length > 0 && field.required) {
                this.editItem[field.fieldname] = this.getLookups(field.fieldname)[0].value;
            }
            else {
                switch (field.type) {
                    case "number":
                        this.editItem[field.fieldname] = field.multiSelectLookups ? [] : 0;
                        break;
                    case "boolean":
                        this.editItem[field.fieldname] = true;
                        break;
                    case "date":
                        let todayIso = moment().format("YYYY-MM-DD");;
                        this.editItem[field.fieldname] = todayIso;
                        break;
                    case "password-with-confirm":
                        this.editItem[field.fieldname] = "";
                        this.editItem[field.fieldnamePasswordConfirm] = "";
                        break;
                    default:
                        this.editItem[field.fieldname] = field.multiSelectLookups ? [] : "";
                        break;
                }
            }

            if (field.type == "number") {
                //dirty hack: fuer edit in string umwandeln
                this.numberToStringEditItem(field);
            }
        }
    }

    private prepareItem() {
        //-- getSelectItem methode zufügen
        if (this.editItem["getSelectItem"] == undefined) {
            this.editItem["getSelectItem"] = (fieldname: string) => {
                return this.getSelectItem(fieldname)
            }
        }

    }

    submitDialog(submitResult: "OK" | string = "OK") {
        this.submitResult = submitResult;
        for (let field of this.getAllDialogFields.filter(f => f.fieldname)) {
            switch (field.controlType) {
                case "grid": {
                    this.editItem[field.fieldname] = this.getDynamicDatasource(field).selectedIds;
                }
            }
            switch (field.type) {
                case "number":
                    //fix von ggf durch HTML Inputs auf string geaenderte numbers => zurueck auf number
                    if (typeof (this.editItem[field.fieldname]) != 'number') {
                        this.stringToNumberEditItem(field);
                    }
                    break;
                case "password-with-confirm":
                    if (this.passwordConfirmInvalid(field)) {
                        this.editItem[field.fieldname] = null;//auf null zurücksetzen => keien aenderung
                    }
                    break;
            }

            if (this.editItem[field.fieldname] == DIALOG_FIELD_NULLVALUE) {
                this.editItem[field.fieldname] = null;
            }
            this.writeEditItemFieldToDtoItemField(field.fieldname, this.editItem[field.fieldname]);
        }
        this.onBeforeSubmit.emit(this.dtoItem);
        this.onSubmit.emit(this.dtoItem);
        //fix weil modal-open nicht herausgenommen wird wenn ein 2ter Dialog geoeffnet wird
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '0px';
    }

    private writeEditItemFieldToDtoItemField(fieldname: string, value: any) {
        if (fieldname) {
            let fieldParts = fieldname.split(".");
            if (!this.dtoItem) this.dtoItem = <T>{};
            let cascObj = this.dtoItem;
            for (let i = 0; i < fieldParts.length; i++) {
                let isLast = i == fieldParts.length - 1;
                if (!isLast) {
                    //unterobjekte instantiieren, wenn noetig
                    if (cascObj[fieldParts[i]] == undefined) {
                        cascObj[fieldParts[i]] = {};
                    }
                    cascObj = cascObj[fieldParts[i]];
                }
                else {
                    cascObj[fieldParts[i]] = value;
                }
            }
        }
    }

    hide() {
        this.dialog.hide();
    }

    cancelDialog() {
        this.submitResult = "CANCEL";
        this.dialog.hide();
    }

    get isSubmitDisabled(): boolean {
        let disabled = false;
        for (let field of this.getAllDialogFields) {
            disabled =
                (field.required && this.fieldIsEmpty(field.fieldname)) ||
                (field.type == "password-with-confirm" && this.passwordConfirmInvalid(field)) ||
                field.min > this.editItem[field.fieldname] || 
                field.max < this.editItem[field.fieldname];
            if (disabled) break;
        }
        return disabled;
    }

    private fieldIsEmpty(fieldname: string) {
        return this.editItem[fieldname] == undefined || this.editItem[fieldname] == null || this.editItem[fieldname] == "" || this.editItem[fieldname] == DIALOG_FIELD_NULLVALUE;
    }

    //extends the dialogFields to dialogFieldConfiguration instances (adds the controlType property and does other initialization or default handling)
    private prepareDialogFields(dialogFields: DialogField[]): DialogField[] {
        let configFields = dialogFields;
        for (var configField of configFields) {
            //auto-configure the control type
            if (!configField.type) configField.type = "text";
            configField.controlType = this.getControlType(configField);//configField.type, configField.lookUps && configField.lookUps.length > 0);

            //handle lookup initialization
            if (configField.lookUps && Array.isArray(configField.lookUps) && configField.lookUps.length > 0) {
                let isArrayOfString = (typeof (configField.lookUps[0]) == 'string');
                if (isArrayOfString) {
                    let stringLookups = <string[]>configField.lookUps;
                    let selectItemLookUps = stringLookups.map((stringLookup: string) => { return <SelectItem>{ text: stringLookup, value: stringLookup } });
                    configField.lookUps = selectItemLookUps;
                }
            }

            //--handle password confirmation
            if (configField.type == "password-with-confirm") {
                if (configField.fieldnamePasswordConfirm == undefined) {
                    configField.fieldnamePasswordConfirm = configField.fieldname + "PasswordConfirm";
                }
            }

            //-- handle multiSelectLookups
            if (configField.multiSelectLookups == undefined) configField.multiSelectLookups = false;
        }
        return configFields;
    }

    private getControlType(field: DialogField): ControlType {
        let result: ControlType;

        let fieldType = field.type;
        if (!fieldType) fieldType = "text";

        let variant: "OTHER" | "SELECT" | "GRID" = "OTHER";
        if (field.lookUps) {
            variant = "SELECT";
        }
        else if (field.grid) {
            variant = "GRID";
        }

        switch (variant) {
            case "SELECT":
                result = "select";
                break;
            case "GRID":
                result = "grid";
                break;
            default:
                switch (fieldType) {
                    case "boolean":
                        result = "checkbox";
                        break;
                    case "date":
                        result = (field.controlTypeVariant == "input") ? "dateInput" : <ControlType>fieldType;
                        break;
                    default:
                        result = <ControlType>fieldType;
                        break;
                }
                break;
        }
        return result;
    }

    private passwordConfirmInvalid(field: DialogField): boolean {
        return this.editItem[field.fieldname] != this.editItem[field.fieldnamePasswordConfirm];
    }

    public hasLookups(fieldname: string): boolean;
    public hasLookups(field: DialogField): boolean;
    public hasLookups(arg1: any): boolean {
        let field: DialogField = typeof (arg1) == 'string' ? this.getDialogField(<string>arg1) : <DialogField>arg1;
        let lookups = this.getLookups(field);
        let emptyCount = field.addEmptyLookup ? 1 : 0;
        return lookups && lookups.length > emptyCount;
    }

    public getLookups(fieldname: string): Array<SelectItem>;
    public getLookups(field: DialogField): Array<SelectItem>;
    getLookups(arg1: any): Array<SelectItem> {
        let field: DialogField = typeof (arg1) == 'string' ? this.getDialogField(<string>arg1) : <DialogField>arg1;
        let lookUpItems = [];
        if (field.lookUps) {
            if (Array.isArray(field.lookUps)) {
                lookUpItems = <Array<SelectItem>>field.lookUps;
            }
            if (typeof (field.lookUps) == 'string') {
                lookUpItems = this.getDynamicLookupItems(field);
            }
        }
        if (field.addEmptyLookup && !lookUpItems.find((item: SelectItem) => item.value == DIALOG_FIELD_NULLVALUE && item.text == field.addEmptyLookup)) {
            lookUpItems.unshift({ value: DIALOG_FIELD_NULLVALUE, text: field.addEmptyLookup });
        }
        if (field.onLookUp) {
            lookUpItems = field.onLookUp(lookUpItems, this.editItem);
        }
        return lookUpItems;
    }

    public doOnChange(keyValueChange: KeyValueChangeRecord<string, any>) {
        let currentValue = keyValueChange.currentValue != undefined && keyValueChange.currentValue != null ? keyValueChange.currentValue.toString() : null;
        let previousValue = keyValueChange.previousValue != undefined && keyValueChange.previousValue != null ? keyValueChange.previousValue.toString() : null;
        if (currentValue != previousValue) {
            let field: DialogField = this.getDialogField(keyValueChange.key);
            if (field && field.onChange) {
                field.onChange(this.editItem, keyValueChange.previousValue);
            }
        }
    }

    public getSelectItem(fieldname: string): SelectItem {
        let selectItems = this.getLookups(fieldname);
        return selectItems.find((s) => { return s.value == this.editItem[fieldname] });
    }

    private get masterComponent(): GenericEditDialogComponent<T> {
        return this;
    }

    public setCatActive(activeCat: DialogFieldCategory) {
        for (var cat of this.categories) {
            cat.active = false;
        }
        activeCat.active = true;
    }

    private setFirstCatActive() {
        let firstCat = this.categories.length > 0 ? this.categories[0] : null;
        if (firstCat) this.setCatActive(firstCat);
    }

    private getDynamicLookupItems(field: DialogField): Array<SelectItem> {
        let lookUpItems: Array<SelectItem> = [];
        let dynamicList = this.getDynamicList(field, field.lookUps);
        if (dynamicList && !dynamicList.lookupItems) {
            this.logger.error("dynamicList with key=" + field.lookUps + " misses the property 'lookupItems'");
            dynamicList = null;
        }
        lookUpItems = dynamicList ? <Array<SelectItem>>dynamicList.lookupItems : [];
        return lookUpItems;
    }

    //private dataSource: DatasourceComponent;
    public getDynamicDatasource(field: DialogField): DatasourceComponent {
        let dataSource: DatasourceComponent = null;
        let dynamicList = this.getDynamicList(field, field.grid.datasource);
        if (dynamicList && !dynamicList.datasource) {
            this.logger.error("dynamicList with key=" + field.grid.datasource + " has no datasource");
            dynamicList = null;
        }
        dataSource = dynamicList ? <DatasourceComponent>dynamicList.datasource : null;
        return dataSource;
    }

    private getDynamicList(field: DialogField, key: any): DialogDynamicList {
        let dynamicList = null;
        if (!this.dynamicLists) {
            this.logger.error('unexpected: dynamicLists Array is undefined');
        }
        else {
            dynamicList = this.dynamicLists.find((dl) => dl.key == key);
            if (!dynamicList) {
                this.logger.warn("dynamicLists with key=" + key + " not found");
            }
        }
        return dynamicList;
    }

    public onButtonClicked(btn: DialogFieldButton, editItem: any) {
        if (btn.onButtonClicked) {
            btn.onButtonClicked(editItem);
        }
        if (btn.submitDialog) {
            this.submitDialog(btn.submitResult);
        }
    }
}
