import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Language, TranslationService } from 'angular-l10n';

import { LoggerService, MessageBoxService, MessageButtons, MessageType } from '../../shared';
import { ResetPasswordWebApiService } from './user-reset-password-web-api.service';

enum passwortResetStep { initial, confirmation, passwortEnter, finish }

@Component({
    selector: 'user-reset-password',
    moduleId: module.id,
    templateUrl: './user-reset-password.component.html',
})

export class UserResetPasswordComponent implements OnInit, OnDestroy {
    constructor(
        public translation: TranslationService,
        private logger: LoggerService,
        private webApiService: ResetPasswordWebApiService,
        private messageBoxService: MessageBoxService,
        private route: ActivatedRoute
    ) {
        this.translation.init();
    }

    @Language() lang: string;
    username: string = "";
    modelUsername: string = "";
    resetToken: string;
    step: passwortResetStep;
    passwort: string = "";
    passwortWiederholen: string = "";
    passwortMatch: boolean = true;
    errorMessage: string = "";

    private routeSubscription: any;
    ngOnInit() {
        this.routeSubscription = this.route.params.subscribe(
            (params) => {
                this.username = decodeURIComponent(params["username"]);
                this.resetToken = params["resetToken"];
            });

        this.step = this.resetToken != null
            ? passwortResetStep.passwortEnter
            : passwortResetStep.initial;

    }

    ngOnDestroy() {
        this.routeSubscription.unsubscribe();
    }

    async requestPasswortResetLink() {
        this.logger.log("PasswortResetComponent.requestPasswortResetLink");
        try {
            await this.webApiService.sendResetPasswordMail(this.modelUsername);
            this.logger.log("PasswortResetComponent.requestPasswortResetLink/success");
            this.step = passwortResetStep.confirmation;
        }
        catch (error) {
            this.logger.log("PasswortResetComponent.requestPasswortResetLink/error");
            this.logger.error(error);
            this.messageBoxService.showDialog("Fehler beim Senden des Benutzernamens", "Fehler", MessageType.WARNING, MessageButtons.CLOSE);

        }
    }

    public get isPasswordInput(): boolean {
        return this.passwort != "" && this.passwortWiederholen != "";
    }

    async resetPassword() {
        this.logger.log("PasswortResetComponent.resetPassword");
        this.errorMessage = "";
        if (this.passwort == this.passwortWiederholen) {
            this.passwortMatch = true;
            try {
                await this.webApiService.resetPassword({
                    username: this.username,
                    newPassword: encodeURIComponent(this.passwort),
                    resetToken: this.resetToken
                });
                this.logger.log("PasswortResetComponent.resetPassword/success");
                this.step = passwortResetStep.finish;
            }
            catch (error) {
                this.logger.error(error);
                if (error["Message"]) this.errorMessage = error["Message"];
            }
        }
        else this.passwortMatch = false;
    }
}
