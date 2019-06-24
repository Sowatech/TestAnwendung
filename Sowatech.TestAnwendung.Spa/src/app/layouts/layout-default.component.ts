import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Language, LocaleService, TranslationService } from 'angular-l10n';

import { AuthService } from '../auth';
import { LoggerService } from '../shared';
import { WebApiSettingsService } from '../web-api/web-api.module';

@Component({
    selector: 'layout-default',
    moduleId: module.id,
    templateUrl: './layout-default.component.html',
})

export class LayoutDefaultComponent implements OnInit, AfterContentChecked {

    constructor(
        private authService: AuthService,
        private logger: LoggerService,
        private router: Router,
        private webApiSettingsService: WebApiSettingsService,
        public locale: LocaleService,
        public translation: TranslationService
    ) {
    }


    @Language() lang: string;

    ngOnInit() {
        document.body.classList.add("fixed-sidebar");
        window.onresize = (event: UIEvent) => { this.onWindowResize() };
        this.onWindowResize();
    }

    ngAfterContentChecked() {
        document.body.classList.remove("gray-bg");
    }

    onWindowResize() {
        if (window.innerWidth <= 768) {
            document.body.classList.add("body-small");
        }
        else {
            document.body.classList.remove("body-small");
        }
    }

    get showAbmelden(): boolean {

        return this.webApiSettingsService.hasCredentials;
    }

    async abmelden() {
        try {
            await this.authService.logout();
            this.router.navigate(['/']);
        }
        catch (error) {
            this.logger.error(error);
        }
        //.subscribe((data: any) => {
        //},
        //(error) => {
        //    this.logger.log("LayoutDefaultComponent abmelden/error");
        //    this.logger.error(error);
        //    //let LOGOUT_SERVER_ERROR_TEXT = this.translation.translate("LAYOUT_DEFAULT.LOGOUT_SERVER_ERROR_TEXT");
        //    //let LOGOUT_SERVER_ERROR_TITLE = this.translation.translate("LAYOUT_DEFAULT.LOGOUT_SERVER_ERROR_TITLE");
        //    //this.messageBoxService.showDialog(LOGOUT_SERVER_ERROR_TEXT, LOGOUT_SERVER_ERROR_TITLE, MessageType.ERROR, MessageButtons.CLOSE);
        //}
        //);
    }

    get showAnmelden(): boolean {
        return !this.webApiSettingsService.hasCredentials;
    }

    anmelden() {
        this.router.navigate(['/login']);
    }

    toggleNavbarMinimalize() {
        if (document.body.classList.contains("mini-navbar")) {
            document.body.classList.remove("mini-navbar");
        }
        else {
            document.body.classList.add("mini-navbar");
        }
    }

    changeLanguage(ev) {
        this.logger.info(ev.currentTarget.value);
        this.locale.setCurrentLanguage(ev.currentTarget.value);
    }
}
