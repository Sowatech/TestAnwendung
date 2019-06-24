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
import { SystemAdministrationWebApiService } from './system-administration-web-api.service';
import { systemAdministrationRouting } from './system-adminstration.routing';
import { SystemSettingsComponent } from './system-settings/system-settings.component';

@NgModule({
    imports: [
        SharedModule,
        systemAdministrationRouting,
        TranslationModule,
        LocalizationModule
    ],
    declarations: [SystemSettingsComponent],
    exports: [],
    providers: [SystemAdministrationWebApiService]
})
export class SystemAdminstrationModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/app/system-settings-' },
        );
        this.l10nLoader.load();
    }
}