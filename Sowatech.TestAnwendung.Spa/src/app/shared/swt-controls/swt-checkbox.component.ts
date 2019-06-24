//see http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel
import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { SwtCheckboxWrapper } from './swt-checkbox-wrapper.component';

const noop = () => { };

export const SWT_CHECKBOX_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SwtCheckboxComponent),
    multi: true
};

@Component({
    selector: 'swt-checkbox',
    moduleId: module.id,
    //directives: [SwtCheckboxWrapper],
    template: `<swt-checkbox-wrapper [size]="size">
                    <input #cb [attr.name]="name" type="checkbox" [style.width]="boxSize" [style.height]="boxSize" style="margin:0" [checked]="value" [(ngModel)]="value"/>
                </swt-checkbox-wrapper>`,
    providers: [SWT_CHECKBOX_VALUE_ACCESSOR]
})

export class SwtCheckboxComponent implements ControlValueAccessor {

    constructor(
        private changeDetectorRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
    }

    @Input('name') name;
    @Input('activeChangeDetectionHack') activeChangeDetectionHack: boolean;

    @Input('size') size: number = 22;
    get boxSize(): string { return this.size + "px" }

    @ViewChild('cb') set checkBoxRef(value: ElementRef) {
        this.checkBox = value.nativeElement;
        this.checkBox.addEventListener("change", (ev) => this.valueChange.emit(this.checkBox.checked));
    }
    checkBox: HTMLInputElement;

    ngAfterViewInit() {
        // Wegen der Umstellung der GenericDialog.ChangeDetection wurde die checkbox nicht richtig gerendert -> noetiger HACK mit PK beschlossen 
        if (this.activeChangeDetectionHack) {
            setTimeout(() => {
                this.refreshBindings();
            }, 200);
        }
    }

    //The internal data model
    private innerValue: boolean;

    //Placeholders for the callbacks which are later provided by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    //From ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    //From ControlValueAccessor interface
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    //Set touched on blur
    onBlur() {
        this.onTouchedCallback();
    }

    //get accessor
    get value(): boolean {
        return this.innerValue;
    };

    //set accessor including call the onchange callback
    set value(v: boolean) {
        if (v !== this.value) {
            this.innerValue = v;
            this.onChangeCallback(v);
        }
    }

    //From ControlValueAccessor interface
    writeValue(v: boolean) {
        if (v !== this.value) {
            this.innerValue = v;
            //this.checkBox.checked = v;
        }
    }

    refreshBindings() {
        this.changeDetectorRef.detectChanges();
    }

    //---------------------

    @Output('change') valueChange: EventEmitter<boolean> = new EventEmitter<boolean>();


}
