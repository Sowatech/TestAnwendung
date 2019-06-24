import { Inject, NgModule } from '@angular/core';
import {
    L10nLoader,
    LocalizationModule,
    ProviderType,
    TRANSLATION_CONFIG,
    TranslationConfig,
    TranslationModule,
} from 'angular-l10n';

import { SharedModule } from '../shared/shared.module';
import { UserInfoComponent } from './user-info/user-info.component';
import { UserProfileWebApiService } from './user-profile-web-api.service';
import { userProfileRouting } from './user-profile.routing';
import { ResetPasswordWebApiService } from './user-reset-password/user-reset-password-web-api.service';
import { UserResetPasswordComponent } from './user-reset-password/user-reset-password.component';
import { UserSettingsEditDialogComponent } from './user-settings/user-settings-edit.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';

@NgModule({
    imports: [
        SharedModule,
        userProfileRouting,
        TranslationModule,
        LocalizationModule
    ],
    declarations: [
        UserInfoComponent,
        UserResetPasswordComponent,
        UserSettingsComponent,
        UserSettingsEditDialogComponent
    ],
    exports: [UserInfoComponent],
    providers: [UserProfileWebApiService, ResetPasswordWebApiService]
})
export class UserProfileModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/app/user-settings-' },
            { type: ProviderType.Static, prefix: './assets/resources/app/user-reset-password-' },
            { type: ProviderType.Static, prefix: './assets/resources/app/user-info-' },
        );
        this.l10nLoader.load();
    }
}