import 'rxjs/Rx';

import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';

import { LoggerService } from '../utilities';

//import { Control } from '@angular/common';
@Directive({ selector: '[dialog-init]' })

export class DialogInitDirective implements AfterViewInit {

    @Input('dialog-init') dialog: ModalDirective;

    nativeElement: HTMLElement;
    constructor(
        el: ElementRef,
        private logger: LoggerService
    ) {
        this.nativeElement = el.nativeElement;

    }

    ngAfterViewInit() {
        this.dialog.onShown.subscribe(() => this.onDialogShown());
    }

    onDialogShown() {

        //select fist tab
        let tabsets = this.nativeElement.getElementsByClassName('nav-tabs');
        if (tabsets && tabsets.length > 0) {
            let tabset = tabsets[0];
            let tabpages = tabset.getElementsByClassName('nav-link');
            if (tabpages) {
                let tabpage = <HTMLElement>tabpages[0];
                if (tabpage) tabpage.click();
            }
        }

        //1) select element with attribute autofocus
        let focusElements: NodeListOf<Element> | HTMLCollectionOf<any> = this.nativeElement.querySelectorAll('[autofocus]');

        if (focusElements.length == 0) {
            //2) select first input control
            focusElements = this.nativeElement.getElementsByTagName('input');
        }
        if (focusElements.length == 0) {
            //3) select first select control
            focusElements = this.nativeElement.getElementsByTagName('select');
        }
        if (focusElements.length > 0) {
            let el = <HTMLElement>focusElements[0];
            el.focus();

            let inputEl = <HTMLInputElement>el;
            if (inputEl.select) {
                inputEl.select();
            }
        }

    }
}