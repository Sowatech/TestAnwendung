import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as JsBarcode from 'jsbarcode';

@Component({
    selector: 'bar-code',
    template: `<img style="width:100%" id="barcode"/>`
})
export class BarCodeComponent {

    public _value: string;
    @Input() set value(value: string) {
        this._value = value;
        JsBarcode("#barcode", value, this.options);
    }
    get value(): string {
        return this._value;
    }    
    @Input() options: any;
}