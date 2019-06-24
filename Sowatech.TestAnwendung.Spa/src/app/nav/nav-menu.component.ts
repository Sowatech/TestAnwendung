import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';

import { LoggerService, Session } from '../shared';
import { NavItem, NavService } from './nav.service';
import { ErrorHandlerService } from '../global';
import { Subscription } from 'rxjs';

const CLASS = "NavMenuComponent";

@Component({
    selector: 'nav-menu',
    templateUrl: './nav-menu.component.html'
})
export class NavMenuComponent implements OnInit {
    constructor(
        private navService: NavService,
        private location: Location,
        private session: Session,
        public translation: TranslationService,
        public logger: LoggerService
    ) {
        this.translation.translationChanged().subscribe(() => {
            this.initNavItems();
        });
    }

    @Language() lang: string;
    @Input() horizontal: boolean;
    @Input() minMenuHeight: number = 300; //pixel
    @Input() menuOuterSpace: number = 150; //pixel

    async ngOnInit() {
        this.logger.log(CLASS + ".ngOnInit start");
        window.onresize = (event: UIEvent) => {
            this.onWindowResize();
        };
        try {
            this.logger.log(CLASS + ".ngOnInit / getNavItems");
            this.items = await this.navService.getNavItems();
            this.logger.log(CLASS + ".ngOnInit / success");
        }
        catch (error) {
            this.errorHandler.serverLoadError(error);
        }

        this.logger.log(CLASS + ".ngOnInit / subscription navItemsChanged");
        this.subscriptions.push(
            this.navService.navItemsChanged.subscribe(
                (navItems) => {
                    this.items = navItems;
                    this.logger.log(CLASS + ".navItemsChanged / refreshed");
                }
            )
        );
    }

    ngOnDestroy() {
        for (var s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    private items: Array<NavItem> = [];

    public hasPath(item: NavItem): boolean {
        return item.path != undefined;
    }

    public getRouterLink(item: NavItem): Array<string> {
        let path = item.path;
        if (!path) path = "/";//bugfix: router config does not accept leading "/" but routerLink requires "/"
        return [path];
    }

    public getId(item: NavItem): string {
        return "nav_" + item.path;
    }

    public isActiveMenuItem(item: NavItem): boolean {
        var currentUrl = this.location.path();
        var isActive = this.navService.isMatchingUrl(currentUrl, item.path);

        ////--rekursion
        if (!isActive && item.items && item.items.length > 0) {
            isActive = item.items.filter((elem) => this.isActiveMenuItem(elem)).length > 0;
        }
        return isActive;
    }

    private get currentUserRoleNames(): string[] {
        let roles = this.session.Data ? this.session.Data.roles : null;
        if (!roles) roles = [];
        return roles;
    }

    visibleForRole(item: NavItem): boolean {
        var visible: boolean = false;
        if ((item.visible == undefined || item.visible) && item.visibleForRoles != null && item.visibleForRoles.length > 0) {
            if (item.visibleForRoles.indexOf("*") >= 0) { visible = true; }
            else {
                for (var roleName of this.currentUserRoleNames) {
                    if (item.visibleForRoles.indexOf(roleName) >= 0
                    ) {
                        visible = true;
                        break;
                    }
                }
            }
        }
        else {
            visible = item.visible;
        }
        return visible;
    }

    public visibleItems(item?: NavItem): Array<NavItem> {
        var items: Array<NavItem> = [];
        if (!item) {
            items = this.items;
        }
        else {
            items = item.items || [];
        }

        var result = items.filter(mitem => this.visibleForRole(mitem));
        return result;
    }

    public hasChildren(item?: NavItem): boolean {
        return this.visibleItems(item).length > 0;
    }

    public toggleCollapse(item: NavItem) {
        item.collapsed = !item.collapsed;
    }

    menuHeight: string = "600px";
    private onWindowResize() {
        this.logger.debug(window.innerHeight.toString());
        let height = window.innerHeight - this.menuOuterSpace;
        if (height < this.minMenuHeight) height = this.minMenuHeight;
        this.menuHeight = height + "px";
    }
}

