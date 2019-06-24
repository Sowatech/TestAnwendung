import { Component, forwardRef, Input, ElementRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as moment from 'moment';
import { TranslationService, Language } from 'angular-l10n';
import { Subscription } from 'rxjs';
import { debug } from 'util';

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SwtDateInputComponent),
    multi: true
};

@Component({
    selector: 'swt-date-input',
    template: `<input type="text" [name]="name" [attr.name]="name" [placeholder]="dateFormat" [textMask]="maskConfig" [(ngModel)]="value" class="form-control" [autofocus]="autofocus" [required]="required" (blur)="onBlur()">`,
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})

export class SwtDateInputComponent implements ControlValueAccessor {

    constructor(
        private translation: TranslationService
    ) {
        this.maskConfig = new TextMaskConfig();
        this.maskConfig.keepCharPositions = true;
    }

    subscriptions: Array<Subscription> = [];
    ngOnInit() {
        
        this.subscriptions.push(
            this.translation.translationChanged().subscribe(
                (lang) => {
                    this.setTranslationProps()
                }
            )
        )
        this.setTranslationProps();
    }

    ngOnDestroy() {
        for (var s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    @Input('placeholder') set _placeholder(value: string) {
        this.placeholder = value;
    }
    public placeholder: string;

    @Input('name') name;
    @Input('autofocus') autofocus;
    @Input('required') required;

    @Language() lang: string;
    private setTranslationProps() {
        let doSetPlaceholder = !this.placeholder || this.placeholder == this.dateFormat;
        if (this.lang.startsWith("en")) {
            this.dateFormat = "MM/DD/YYYY";
            this.maskConfig.mask = [/[0-1]/, /[0-9]/, '/', /[0-3]/, /[0-9]/,'/',/[1-2]/, /[0-9]/, /[0-9]/, /[0-9]/];
        }
        else {
            this.dateFormat = "DD.MM.YYYY";
            this.maskConfig.mask = [/[0-3]/, /[0-9]/, '.', /[0-1]/, /[0-9]/, '.', /[1-2]/, /[0-9]/, /[0-9]/, /[0-9]/];
        }
        if (doSetPlaceholder) this.placeholder = this.dateFormat;
    }

    public maskConfig: TextMaskConfig;
    public languageIso: string;
    public dateFormat: string;

    private valueType = ValueType.Undefined;

    //The internal data model
    private innerValue: any = undefined;

    //Placeholders for the callbacks which are later providesd
    //by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    //get accessor
    get value(): any {
        return this.innerValue;
    };

    //set accessor including call the onchange callback
    set value(v: any) {
        if (v !== this.innerValue) {
            let theMoment = moment(v, this.dateFormat, true);
            if (theMoment.isValid()) {
                this.innerValue = v;
                let changeValue = this.valueType == ValueType.DateString ? theMoment.format("YYYY-MM-DD") : theMoment.toDate();
                this.onChangeCallback(changeValue);
            }
        }
    }

    //Set touched on blur
    onBlur() {
        this.onTouchedCallback();
    }

    //From ControlValueAccessor interface
    writeValue(value: any) {
        
        if (value!= undefined && this.valueType == ValueType.Undefined) {
            this.valueType = (typeof (value) == "string") ? ValueType.DateString : ValueType.DateObject;
        }

        let textValue = moment(value).format(this.dateFormat);
        if (textValue !== this.innerValue) {
            this.innerValue = textValue;
        }
    }

    //From ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    //From ControlValueAccessor interface
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

}

enum ValueType {
    Undefined,
    DateString,
    DateObject
}

export class TextMaskConfig {
    mask: Array<RegExp | string>;
    guide?: boolean;// default = true
    placeholderChar?: string;//defauls = '_'
    pipe?: (string) => string;
    keepCharPositions?: boolean;//default=false
};
