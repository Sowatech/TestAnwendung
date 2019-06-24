import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    L10nLoader,
    LocalizationModule,
    ProviderType,
    TRANSLATION_CONFIG,
    TranslationConfig,
    TranslationModule,
} from 'angular-l10n';

import { NavModule } from '../nav/nav.module';
import { SharedModule } from '../shared/shared.module';
import { UtilitiesModule } from '../shared/utilities/utilities.module';
import { WebApiModule } from '../web-api/web-api.module';
import { authRouting } from './auth.routing';
import { LoginComponent } from './login.component';

@NgModule({
    imports: [ 
        authRouting,
        CommonModule,
        FormsModule,
        SharedModule,
        WebApiModule,
        UtilitiesModule,
        NavModule,
        TranslationModule,
        LocalizationModule
    ],
    declarations:[LoginComponent]
})
export class AuthModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/app/login-' },
        );
        this.l10nLoader.load();
    }
}