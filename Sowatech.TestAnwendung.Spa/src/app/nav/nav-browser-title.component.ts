import { Component, OnInit, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Language, TranslationService } from 'angular-l10n';
import { Subscription } from 'rxjs/Subscription';

import { NavService } from './nav.service';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'nav-browser-title',
    template: '',
})

export class NavBrowserTitleComponent implements OnInit {
    constructor(
        private navService: NavService,
        private router: Router,
        private browserTitle: Title,
        public translation: TranslationService
    ) {
        this.subscriptions.push(
            this.translation.translationChanged().subscribe(() => { this.refreshTitle(); }),
            this.router.events.subscribe((val) => { if (val instanceof NavigationEnd) this.refreshTitle() })
        );
    }

    @Input('browserTabTitlePrefix') browserTabTitlePrefix: string = "";
    @Input('browserTabTitlePostfix') browserTabTitlePostfix: string = "";

    @Language() lang: string;

    private subscriptions = new Array<Subscription>();
    ngOnInit() {
        this.refreshTitle();
        this.subscriptions.push();
    }

    ngOnDestroy() {
        for (var s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    private refreshTitle() {
        let currentNavItemPath = this.navService.getNavItemPathElements();

        let browserTabTitle = currentNavItemPath.length > 0 ? currentNavItemPath[currentNavItemPath.length - 1].text : "";
        if (this.browserTabTitlePrefix) browserTabTitle = this.browserTabTitlePrefix + browserTabTitle;
        if (this.browserTabTitlePostfix) browserTabTitle = browserTabTitle + this.browserTabTitlePostfix;

        this.browserTitle.setTitle(browserTabTitle);
    }

}
