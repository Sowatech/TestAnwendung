import { Component, Input, ContentChild, ContentChildren, QueryList, AfterContentInit, forwardRef } from '@angular/core';

@Component({
    selector: 'swt-checkbox-wrapper',
    moduleId: module.id,
    template: `<div style="position: relative; float:left">
                        <div class="form-control" [style.height]="boxSize" [style.width]="boxSize" style="padding:0">
                                <div class="text-center" [ngClass]="{'bg-success': isChecked, 'bg-default': !isChecked}" [style.height]="boxSize" [style.width]="boxSize">
                                    <i *ngIf="isChecked" class="fa fa-check" [style.fontSize]="fontSize" [style.lineHeight]="boxSize"></i>
                                    <i *ngIf="isIntermediate" class="fa fa-question" [style.fontSize]="fontSize" [style.lineHeight]="boxSize"></i>
                                    <div [style.height]="boxSize" [style.width]="boxSize" style="top:0; position: absolute; opacity: 0;"><ng-content></ng-content></div>
                                </div>
                        </div>
                 </div>`
})
export class SwtCheckboxWrapper implements AfterContentInit {

    constructor() {
    }

    @Input('size') sizePixel: number = 22;

    get fontSize(): string {
        let calc = (this.sizePixel / 3) * 2;
        return calc.toString() + "px";
    }

    get boxSize(): string {
        return this.sizePixel + "px";
    }

    @ContentChild('cb') set contentChild(value: any) {
        this.checkBoxControl = value.nativeElement;
    }
    checkBoxControl: HTMLInputElement;

    ngOnInit() {

    }

    ngAfterContentInit() {
    }

    get isChecked(): boolean {
        return this.checkBoxControl.checked;
    }

    get isIntermediate(): boolean {
        let result = this.checkBoxControl.checked === null || this.checkBoxControl.checked === undefined;
        return result;
    }
}

