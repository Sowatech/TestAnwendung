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
import { ClientProfileWebApiService } from './client-profile-web-api.service';
import { clientProfileRouting } from './client-profile.routing';
import { ClientSettingsComponent } from './client-settings/client-settings.component';

	
@NgModule({
    imports: [
        SharedModule,
        clientProfileRouting,
        TranslationModule,
        LocalizationModule],
    declarations: [ClientSettingsComponent],
    exports: [],
    providers: [ClientProfileWebApiService]
})
export class ClientProfileModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/app/client-settings-' },
        );
        this.l10nLoader.load();
    }
}