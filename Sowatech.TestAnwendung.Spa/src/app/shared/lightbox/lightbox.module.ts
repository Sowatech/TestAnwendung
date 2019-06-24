import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import {
    L10nLoader,
    LocalizationModule,
    ProviderType,
    TRANSLATION_CONFIG,
    TranslationConfig,
    TranslationModule,
} from 'angular-l10n';

import { LightboxComponent } from './lightbox.component';

@NgModule({
    imports: [
        CommonModule,
        TranslationModule,
        LocalizationModule
    ],
    declarations: [LightboxComponent],
    exports: [LightboxComponent]
})
export class LightboxModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/shared/lightbox-' },
        );
        this.l10nLoader.load();
    }
}
