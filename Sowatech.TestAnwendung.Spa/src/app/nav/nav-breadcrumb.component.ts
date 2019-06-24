import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Language, TranslationService } from 'angular-l10n';

import { NavItem } from './nav.model';
import { NavService } from './nav.service';

@Component({
    selector: 'nav-breadcrumb',
    moduleId: module.id,//ermoeglicht relative path for templateUrl
    templateUrl: './nav-breadcrumb.component.html',
})

export class NavBreadcrumbComponent  implements OnInit {
    constructor(
        private navService: NavService,
        private router: Router,
        public translation: TranslationService
    ) {
        this.translation.translationChanged().subscribe(() => {
            this.refreshBreadcrumbs();
        });
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) this.refreshBreadcrumbs()
        });
    }

    @Language() lang: string;
    breadcrumbs: Array<NavItem> = [];

    ngOnInit() {
        this.refreshBreadcrumbs();
    }

    private refreshBreadcrumbs() {
        this.breadcrumbs = this.navService.getNavItemPathElements();
    }

    breadcrumbClicked(breadcrumb: NavItem) {
        if (breadcrumb.path == "CUSTOM") {
            this.navService.triggerOnCustomNavigate(breadcrumb);
        }
        else {
            let path = "/" + breadcrumb.path;
            this.router.navigate([path])
        }
    }
}