import { Component } from "@angular/core";
import { MenuController, NavParams, NavController, LoadingController, Loading, ToastController } from "ionic-angular";

import { LoggerService, LoaderService } from "../../shared";
import { LoginPageService } from "./login.service";
import { LoginPageModel } from './login.model';
import { HomePage } from '../index';

@Component({
    selector: 'login-page',
    templateUrl: 'login.page.html',
    providers: [LoginPageService]
})
export class LoginPage {

    constructor(
        public nav: NavController,
        public menu: MenuController,
        public navParams: NavParams,
        private loginApiService: LoginPageService,
        private loggerService: LoggerService,
        private loaderService: LoaderService,
        private toastCtrl: ToastController
    ) {
        if (navParams.get('logout')) {
            this.logout();
        } else if (this.loginApiService.hasCredentials()) {
            this.nav.setRoot(HomePage);//redirect if no param logout and hasCredentials
        }
        this.menu.enable(false);
    }

    model = new LoginPageModel();
    submitted = false;

    async login(valid: boolean) {
        this.loggerService.info("LoginPage.login");
        if (valid) {
            this.loaderService.show("Login...");
            try {
                await this.loginApiService.login(this.model.username, this.model.password).toPromise();
                await this.loaderService.hide();
                this.nav.setRoot(HomePage);
            }
            catch (err) {
                this.loaderService.hide();
                this.toastCtrl.create({ message: "Fehler beim Einloggen", position: "top", showCloseButton: true, closeButtonText: "ok", duration: 3000 }).present();
            }
        }
    }

    async logout(): Promise<void> {
        this.loggerService.info("LoginPage.logout");
        await this.loginApiService.logout().toPromise();
        await this.loginApiService.clearData();
        return Promise.resolve();
    }

    ionViewWillLeave(): void { this.menu.enable(true); }
}