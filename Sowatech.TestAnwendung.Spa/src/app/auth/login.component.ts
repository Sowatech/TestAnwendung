import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Language, TranslationService } from 'angular-l10n';
import { Subscription } from 'rxjs';

import { LoggerService, SessionDataDto } from '../shared';
import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';

@Component({
    selector: "login",
    templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
    constructor(public authService: AuthService, public translation: TranslationService, public router: Router, public logger: LoggerService, public authGuard: AuthGuard, public route: ActivatedRoute) {
        this.isLoggedIn = this.authService.isLoggedIn;

        this.subscriptions.push(
            this.route.params.subscribe(params => {
                this.username = params["username"];
                this.password = params["password"];
                if (this.username && this.password) {
                    this.anmelden();
                }
            })
        );
    }

    @Language()
    lang: string;
    customErrorText: string = "";
    loginStartedText: string = "";
    username: string;
    password: string;
    subscriptions: Array<Subscription> = [];

    ngOnInit() {
        // let sessionData = localStorage.getItem("Session.");
        // if (sessionData && sessionData["userName"]) this.loggedInUsername = sessionData["userName"];

        this.subscriptions.push(
            this.translation.translationChanged().subscribe(() => {
                this.setTranslationProps();
            })
        );
        this.setTranslationProps();
    }

    setTranslationProps() {
        setTimeout(() => {
            this.welcome_title = this.translation.translate("LOGIN.WELCOME_TITLE");
            this.welcome_text = this.translation.translate("LOGIN.WELCOME_TEXT");
            this.username_label_text = this.translation.translate("LOGIN.USERNAME_LABEL_TEXT");
            this.username_required_text = this.translation.translate("LOGIN.USERNAME_REQUIRED_TEXT");
            this.password_label_text = this.translation.translate("LOGIN.PASSWORD_LABEL_TEXT");
            this.password_required_text = this.translation.translate("LOGIN.PASSWORD_REQUIRED_TEXT");
            this.login_btn_text = this.translation.translate("LOGIN.LOGIN_BTN_TEXT");
            this.password_reset_nav_text = this.translation.translate("LOGIN.PASSWORD_RESET_NAV_TEXT");
            this.translationLoaded = true;
        }, 100);
    }

    public translationLoaded: boolean = false;
    public isLoggedIn: boolean = false;

    public welcome_title: string;
    public welcome_text: string;
    public username_label_text: string;
    public username_required_text: string;
    public password_label_text: string;
    public password_required_text: string;
    public login_btn_text: string;
    public password_reset_nav_text: string;
    public loggedInUsername: string;

    async anmelden() {
        this.customErrorText = "";
        if (this.username && this.password) {
            this.loginStartedText = this.translation.translate("LOGIN.INFO_LOGIN_STARTED");
            
            try {
                let result: SessionDataDto = await this.authService.login(this.username, this.password);
                this.loginStartedText = "";
                //let defaultRoutePath = "/";
                //let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : defaultRoutePath;
                //this.router.navigate([redirect]);
                await this.navigateToFirst();
            }
            catch (error) {
                this.logger.error(error);
                this.customErrorText = "";
                if (error.status) {
                    this.customErrorText = error.status + " ";
                }
                if (error._body) {
                    try {
                        let errorBody = JSON.parse(error._body);
                        this.customErrorText += errorBody.error_description;
                    }
                    catch (parseError) {
                    }
                }
                else {
                    //this.customErrorText += error;
                }
                if (!this.customErrorText) this.customErrorText = this.translation.translate("LOGIN.ERROR_UNEXPECTED");
                this.loginStartedText = "";
            }
        }
        this.isLoggedIn = this.authService.isLoggedIn;
    }

    navigateToPasswortReset() {
        this.router.navigate(["passwortreset"]);
    }

    navigateToRegister() { }

    navigateToFirst() {
        this.authGuard.tryRedirectToFirstVisibleMenuItem();
    }

    async logout() {
        this.logger.log(CLASS + ".logout");
        try {
            //await this.authService.logout();
            this.authService.logout();//extra kein await. Kann im Hintergrund passieren
        }
        catch (error) {
            this.logger.error(CLASS + ".logout: " + error != null ? JSON.stringify(error) : "" );
        }

        this.logger.log(CLASS + ".logout / clear");
        this.webApiSettingsService.removeCredentials();
        this.session.clearData();
        this.isLoggedIn = this.authService.isLoggedIn;
    }
}
