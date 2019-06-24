import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService, Session } from '../utilities';

@Component({
    selector: 'visible-for-role',
    template: `<ng-container *ngIf="sessionHasRole">
                    <ng-content></ng-content>
                </ng-container>
`
})

export class VisibleForRoleComponent implements OnInit, OnDestroy {

    @Input('roles') set _roles(value: string | string[]) {
        if (value && typeof (value) == 'string') {
            this.roles = (<string>value).split(",");
        }
        else {
            this.roles = <string[]>value;
        }
    }

    private roles: string[];

    constructor(
        private session: Session,
        private logger: LoggerService
    ) { }

    private subscriptions = new Array<Subscription>();

    ngOnInit() { }

    ngOnDestroy() { this.subscriptions.map(s => s.unsubscribe()) }

    get sessionHasRole(): boolean {
        return this.session.Data.roles.some(item => this.roles.indexOf(item) >= 0);
    }

    get isVisible(): boolean {
        return this.sessionHasRole;
    }
}