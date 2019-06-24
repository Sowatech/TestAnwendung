import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { NavItem, NavService } from '../nav/nav.service';
import { LoggerService, Session } from '../shared/utilities';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private navService: NavService,
        private session: Session,
        private logger: LoggerService,
        private router: Router) {
    }

    public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        this.logger.info("AuthGuard.canActivate " + state.url);
        return new Promise<boolean>(async (resolve, reject) => {
            let requiredRoles = this.routeRequiredRoles(state);
            let requiresAuthorization = requiredRoles.length > 0;
            let result = true;
            let isRedirected = false;
            if (requiresAuthorization) {
                this.logger.info("AuthGuard.canActivate/requiresAuthorization");
                result = false;
                if (this.authService.isLoggedIn) {
                    if (this.currentUserHasRequiredRole(requiredRoles)) {
                        result = true;
                        if (this.authService.isLoggedIn) {
                            result = await this.testServerAuthentication();
                        }
                    }
                    else {
                        this.logger.warn("AuthGuard.canActivate/currentUserHasRequiredRole = false. try redirect to first allowed route");
                        isRedirected = this.tryRedirectToFirstVisibleMenuItem();
                    }
                }
            }
            resolve(result);
            if (!result && !isRedirected) {
                this.logger.info("AuthGuard.canActivate/NOT authorized=>navigate to login");
                this.navigateToLogin(state);
            }

        });
    }

    private async testServerAuthentication(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            let result = true;
            try {
                this.logger.info("AuthGuard.canActivate/testAuthentication");
                await this.authService.testAuthentication();
                this.logger.log("AuthGuard.canActivate/testAuthentication:success");
            }
            catch (error) {
                this.logger.warn("AuthGuard.canActivate/testAuthentication:failed");
                result = false;
            }
            resolve(result);
        });
    }

    private routeRequiredRoles(state: RouterStateSnapshot): TRoleNames[] {
        let navItem = this.navService.getNavItem(state.url);
        let hasRequiredRoles = navItem && navItem.visibleForRoles && navItem.visibleForRoles.length > 0;
        return hasRequiredRoles ? navItem.visibleForRoles : [];
    }

    private get currentUserRoles(): string[] {
        let rolesExists = this.session && this.session.Data && this.session.Data.roles;
        return rolesExists ? this.session.Data.roles : [];
    }

    private currentUserHasRequiredRole(requiredRoles: TRoleNames[]) {
        return this.currentUserRoles.some(role => requiredRoles.indexOf(role) >= 0);
    }

    public async handleAuthError(error: Error) {
        return new Promise((resolve, reject) => {
            let errorStatus: number = error && error["status"] && error["status"] ? error["status"] : null;
            let errorUrl: string = error && error["url"] ? error["url"] : "";
            if (errorStatus == 401 || errorStatus == 400 && errorUrl.includes("Token")) {
                setTimeout(
                    async () => {
                        await this.navigateToLogin(this.router.routerState.snapshot);
                        resolve(true);
                    }, 0);
            }
            else {
                resolve(false);
            }
        });
    }

    private async navigateToLogin(state: RouterStateSnapshot) {
        this.authService.redirectUrl = state.url;
        return this.router.navigate(['/login']);
    }

    public tryRedirectToFirstVisibleMenuItem(): boolean {
        this.logger.log("AuthGuard.tryNavigateToFirstVisibleMenuItem");
        let foundNavItems = this.recursiveFindNavItemsVisibleForRole(this.navService.navItems, this.session.Data.roles);
        if (foundNavItems.length > 0) {
            this.logger.log("AuthGuard.tryNavigateToFirstVisibleMenuItem found visible navItems.length=" + foundNavItems.length);
            this.logger.log("AuthGuard.tryNavigateToFirstVisibleMenuItem found navigate to =" + foundNavItems[0].path);
            let path = foundNavItems[0].path;
            this.router.navigate([path]);
            return true;
        }
        else {
            this.logger.warn("AuthGuard.tryNavigateToFirstVisibleMenuItem failed");
            return false;
        }
    }

    private hasRolesIntersection(rolesA: string[], rolesB: string[]): boolean {
        return (rolesA && rolesA.some(visRole => { return rolesB.indexOf(visRole) >= 0 }));
    }

    private recursiveFindNavItemsVisibleForRole(navItems: NavItem[], roles: string[]): NavItem[] {
        let resultList = new Array<NavItem>();
        if (navItems) {
            for (let navItem of navItems) {
                let isVisible = navItem.visible || this.hasRolesIntersection(navItem.visibleForRoles, roles);
                if (navItem.path && isVisible) {
                    resultList.push(navItem);
                }

                let hasSubItems = navItem.items && navItem.items.length > 0;
                let currentIsForbidden = navItem.visibleForRoles && !this.hasRolesIntersection(navItem.visibleForRoles, roles);

                //---subitems recursion
                if (hasSubItems && !currentIsForbidden) {
                    let foundSubItems = this.recursiveFindNavItemsVisibleForRole(navItem.items, roles);
                    if (foundSubItems.length > 0) resultList = resultList.concat(foundSubItems);
                }
            }
        }
        return resultList;
    }
}

type TRoleNames = string;
