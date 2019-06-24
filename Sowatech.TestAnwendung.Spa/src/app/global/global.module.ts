import { NgModule, Inject } from '@angular/core';
import { ErrorHandlerService } from './error-handler.service';

import { DialogUserAddService } from "./dialogs/user/dialog-user-add.service";
import { DialogUserUpdateService } from "./dialogs/user/dialog-user-update.service";
import { DialogUserSetPasswordService } from "./dialogs/user/dialog-user-set-password.service";
import { DialogUserChangePasswordService } from "./dialogs/user/dialog-user-change-password.service";
import { DialogUserProfileUpdateService } from "./dialogs/user/dialog-user-profile-update.service";
import { TranslationModule, ProviderType, TranslationConfig, TRANSLATION_CONFIG, L10nLoader } from 'angular-l10n';

import { DialogClientService } from "./dialogs/client/dialog-client.service";
import { DialogClientAddService } from "./dialogs/client/dialog-client-add.service";
import { DialogSmtpService } from "./dialogs/system/dialog-smtp.service";

@NgModule({
    imports: [
        TranslationModule,
    ],
    declarations: [],
    providers: [
        ErrorHandlerService,
        //-- user
        DialogUserAddService,
        DialogUserUpdateService,
        DialogUserSetPasswordService,
        DialogUserChangePasswordService,
        DialogUserProfileUpdateService,
        //-- client
        DialogClientService,
        DialogClientAddService,
        //-- Smtp
        DialogSmtpService
        //-- 
    ]
})
export class GlobalModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig,
        //-- user
        private dialogUserAddService: DialogUserAddService,
        private dialogUserUpdateService: DialogUserUpdateService,
        private dialogUserSetPasswordService: DialogUserSetPasswordService,
        private dialogUserChangePasswordService: DialogUserChangePasswordService,
        private dialogUserProfileUpdateService: DialogUserProfileUpdateService,
        private dialogClientService: DialogClientService,
        private dialogClientAddService: DialogClientAddService,
        private dialogSmtpService: DialogSmtpService
    ) {
        this.init();
    }

    private async init() {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/app/global-' },
        );
        await this.l10nLoader.load();
        //-- user
        this.dialogUserAddService.register();
        this.dialogUserUpdateService.register();
        this.dialogUserSetPasswordService.register();
        this.dialogUserChangePasswordService.register();
        this.dialogUserProfileUpdateService.register();
        //--- client
        this.dialogClientService.register();
        this.dialogClientAddService.register();
        //--- smtp
        this.dialogSmtpService.register();
        //--- 
    }
}