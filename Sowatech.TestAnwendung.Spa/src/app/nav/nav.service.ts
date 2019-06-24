import { Location } from '@angular/common';
import { EventEmitter, Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { TranslationService } from 'angular-l10n';
import { Subject } from 'rxjs/Subject';

import { LoggerService } from '../shared';
import { NavDataService } from './nav-data.service';
import { NavItem } from './nav.model';
import { NavWebApiService } from './nav-web-api.service';
import { NavItemsDto } from './nav.dtos';

const CLASS = "NavService";

//--exports
export { NavItem } from './nav.model';

@Injectable()
export class NavService {

    constructor(
        private location: Location,
        private router: Router,
        private navData: NavDataService,
        private loggerService: LoggerService,
        public translation: TranslationService,
        public webApiService: NavWebApiService
    ) {
        this.translation.translationChanged().subscribe(
            (lang:string) => {
                if (lang && lang != this.lang) {
                    this.lang = lang;
                    this.loggerService.log(CLASS + ".translationChanged " + lang + " / loadNavItems");
                    this.loadNavItems();
                }
            });
    }

    private lang: string;

    public isServerMenu: boolean = false;
    public navItemsChanged = new Subject<Array<NavItem>>();

    private navItems: Array<NavItem> = [];
    
    public async getNavItems(): Promise<Array<NavItem>> {
        this.loggerService.log(CLASS + ".getNavItems");
        if (this.navItems.length == 0) {
            await this.loadNavItems();
        }
        return this.navItems;
    }

    public resetMenu() {
        if (this.navItems.length > 0) {
            this.loggerService.log(CLASS + ".resetMenu");
            this.navItems = [];
            this.navItemsChanged.next(this.navItems);
        }
    }

    private async loadNavItems(): Promise<void> {
        this.loggerService.log(CLASS + ".loadNavItems");
        try {
            //--- load
            let rawNavItems: NavItem[] = [];
            if (!this.isServerMenu) {
                rawNavItems = await this.navData.navItems().toPromise();
            }
            else {
                let dto: NavItemsDto = await this.webApiService.getNavMenu();
                rawNavItems = dto.navItems;
            }
            this.loggerService.log(CLASS + ".loadNavItems / " + rawNavItems.length);

            //--- Init
            this.navItems = [];
            for (var rawItem of rawNavItems) {
                let navItem = this.recursiveInitNavItems(rawItem);
                this.navItems.push(navItem);
            }
            this.loggerService.log(CLASS + ".loadNavItems / " + this.navItems.length);
            this.loggerService.log(CLASS + ".loadNavItems / success");

            //--- Event
            this.navItemsChanged.next(this.navItems);

        }
        catch (err) {
            this.loggerService.log(CLASS + ".loadNavItems / error");
            this.loggerService.log(err);
        }
    }

    public doActionForAllNavItems(action: (navItem: NavItem) => void) {
        if (this.navItems) {
            for (let navItem of this.navItems) {
                this.recursiveDoActionForNavItem(navItem, action);
            }
        }
    }

    public recursiveDoActionForNavItem(navItem: NavItem, action: (navItem: NavItem) => void) {
        action(navItem);
        if (navItem.items) {
            for (let subNavItem of navItem.items) {
                this.recursiveDoActionForNavItem(subNavItem, action);
            }
        }
    }

    public getNavItemPathElements(url?: string): Array<NavItem> {
        if (!url) {
            url = this.location.path();
        }
        let resultPath = new Array<NavItem>();
        this.recursiveFindItem(MatchType.Url, url, this.navItems, resultPath);
        resultPath = resultPath.reverse();
        return resultPath;
    }

    //https://angular.io/docs/ts/latest/cookbook/component-communication.html#!#bidirectional-service
    public onCustomNavigate = new Subject<NavItem>();
    public triggerOnCustomNavigate(navItem: NavItem) {
        this.onCustomNavigate.next(navItem);
    }

    public getNavItem(url?: string): NavItem {
        var path = this.getNavItemPathElements(url);
        return path.length > 0 ? path[path.length - 1] : null;
    }

    public isMatchingUrl(url: string, navUrl: string): boolean {
        return NavService.isMatchingUrl(url, navUrl);
    }

    private static removeLeadingSlash(path: string): string {
        let result = path;
        if (result.substring(0, 1) == "/") result = result.slice(1, result.length);
        return result;
    }

    private static isMatchingUrl(url: string, navUrl: string): boolean {
        let result = false;
        if (url != undefined && navUrl != undefined) {
            url = this.removeLeadingSlash(url);
            navUrl = this.removeLeadingSlash(navUrl);

            if (url == navUrl) {
                result = true;
            }
            else {
                let placeholder = '/:';
                let placeholderIndex = navUrl.indexOf(placeholder);
                if (placeholderIndex >= 0) {
                    let navUrlWithoutPlaceHolder = navUrl.substring(0, placeholderIndex);
                    let urlAtPlace = url.length > navUrlWithoutPlaceHolder.length ? url.charAt(navUrlWithoutPlaceHolder.length) : "";
                    result =
                        url.substring(0, navUrlWithoutPlaceHolder.length) == navUrlWithoutPlaceHolder && urlAtPlace == "/";
                }
                else {
                    result = false;
                }
            }
        }
        return result;
    }

    //find the matching menuItem by comparing with searchValue (according to MatchType)
    //returns false if no match found, otherwise true
    //if success: adds all MenuItem (beginning with the matching, ending with root) of all levels of the menu hierarchy
    private recursiveFindItem(r: MatchType, searchValue: string, items: Array<NavItem>, resultPath: Array<NavItem>): boolean {
        let found = false;
        if (items && items.length > 0) {

            let resultItem;
            switch (r) {
                case MatchType.Url: {
                    let matchingItems = items.filter(elem => NavService.isMatchingUrl(searchValue, elem.path));
                    matchingItems.sort((a: NavItem, b: NavItem) => b.path.length - a.path.length);
                    resultItem = matchingItems.length > 0 ? matchingItems[0] : null;
                    break;
                }
                //case MatchType.NavItemName: {
                //    let matchingItems = items.filter(elem => elem.name && elem.name == searchValue);
                //    resultItem = matchingItems.length > 0 ? matchingItems[0] : null;
                //    break;
                //}
            }

            if (!resultItem) {
                found = items.some(item => {
                    let subItemFound = this.recursiveFindItem(r, searchValue, item.items, resultPath);
                    if (subItemFound) {
                        resultPath.push(item);
                    }
                    return subItemFound;
                }
                );
            }
            else {
                resultPath.push(resultItem);
                found = true;
            }
        }
        return found;
    }

    private getNavigateCommands(navItemName: string, args?: any[], extras?: NavigationExtras): Array<any> {
        this.loggerService.log("nav.service.getNavigateCommands");
        let commands = [];
        let resultPath = new Array<NavItem>();
        if (this.recursiveFindItem(MatchType.NavItemName, navItemName, this.navItems, resultPath)) {
            let routerLink = resultPath[0].path;
            commands = new Array<any>();
            commands.push(routerLink);
            if (args) {
                commands = commands.concat(args);
            }
        }
        return commands;
    }

    public navigate(navItemName: string, args?: any[], extras?: NavigationExtras) {
        this.loggerService.log("nav.service.navigate");
        let commands = this.getNavigateCommands(navItemName, args, extras);
        if (commands.length > 0) {
            this.router.navigate(commands, extras);
            //            this.router.createUrlTree(commands).
        }
    }

    public setCustomNavTitle(title: string) {
        this.onSetCustomNavTitle.emit(title);
    }

    public onSetCustomNavTitle = new EventEmitter<string>();
}

enum MatchType { Url, NavItemName };