import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService, Session } from '../utilities';


@Directive({ selector: '[visible-for-role]' })

export class VisibleForRoleDirective implements OnInit, OnDestroy {

    @Input('visible-for-role') set _visibleForRoles(value: string | string[]) {
        if (value && typeof (value) == 'string') {
            this.visibleForRoles = (<string>value).split(",");
        }
        else {
            this.visibleForRoles = <string[]>value;
        }
    }

    private visibleForRoles: string[];

    private nativeElement: HTMLElement;

    constructor(
        el: ElementRef,
        private session: Session,
        private logger: LoggerService
    ) {
        this.nativeElement = el.nativeElement;
    }

    private subscriptions = new Array<Subscription>();

    ngOnInit() {
        if (this.sessionHasRole) {
            this.setClassNone();
        }
        else {
            this.setClassHidden();
        }
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    private get sessionHasRole(): boolean {
        return this.session.Data.roles.some(item => this.visibleForRoles.indexOf(item) >= 0);
    }

    private setClassNone() {
        this.removeClass('hidden');
    }

    private setClassHidden() {
        this.addClass('hidden');
    }

    private removeClass(className: string) {
        this.nativeElement.classList.remove(className);
    }

    private addClass(className: string) {
        if (!this.nativeElement.classList.contains(className)) this.nativeElement.classList.add(className);
    }

    //@HostListener('click') onClick() {

    //}

}
