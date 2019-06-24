import { Component, ViewContainerRef } from '@angular/core';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { LoggerService, Session } from './shared';

@Component({
    selector: 'TestAnwendung-app',
    templateUrl: './app.component.html',
    styleUrls: ["./app.component.css"]
})

export class AppComponent {
    title = 'TestAnwendung';

    constructor(
        private viewContainerRef: ViewContainerRef,
        private logger: LoggerService,
        private session: Session,
        private router: Router
    ) {
        this.viewContainerRef = viewContainerRef;//ng2-bootstrap hack
    }

    private onSessionChanged(sessionData) {
        if (!sessionData) {
            this.logger.log("AppComponent.onSessionChanged/no Session Data => navigate to login");
            if (this.router.url != '/login') this.router.navigate(['/login']);
        }
    }
}
