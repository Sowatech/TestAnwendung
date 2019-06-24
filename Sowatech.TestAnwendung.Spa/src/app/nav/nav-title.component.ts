import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Language, TranslationService } from 'angular-l10n';
import { Subscription } from 'rxjs/Subscription';

import { NavService } from './nav.service';

@Component({
    selector: 'nav-title',
    moduleId: module.id,//ermoeglicht relative path for templateUrl
    template: `{{title}}
    `,
    providers: []
})

export class NavTitleComponent  implements OnInit, OnDestroy {
    constructor(
        private navService: NavService,
        private router: Router,
        public translation: TranslationService
    ) {
        this.subscriptions.push(
            this.translation.translationChanged().subscribe(() => {this.refreshTitle();}),
            this.router.events.subscribe((val) => {if (val instanceof NavigationEnd) this.refreshTitle()})
        );
    }

    @Language() lang: string;
    public title: string;

    private subscriptions = new Array<Subscription>();
    ngOnInit() {
        this.refreshTitle();
        this.subscriptions.push(
            this.navService.onSetCustomNavTitle.subscribe(
                (customTitle: string) => {
                    this.title = customTitle;
                })
        );
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    private refreshTitle() {
        let currentNavItemPath = this.navService.getNavItemPathElements();
        this.title = currentNavItemPath.length > 0 ? currentNavItemPath[currentNavItemPath.length - 1].text : "";
    }

}
