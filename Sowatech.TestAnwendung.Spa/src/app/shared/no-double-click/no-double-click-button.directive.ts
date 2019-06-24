import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: 'button'
})
export class NoDblClickButtonDirective {

    constructor() { }

    @HostListener('click', ['$event'])
    clickEvent(event: MouseEvent) {
        let target: Element = (<Element>event.target) || event.srcElement; 
        target.setAttribute('disabled', "true");
        setTimeout(function () {
            target.removeAttribute('disabled');
        }, 500);
    }
}
