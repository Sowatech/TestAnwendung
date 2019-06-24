import { Inject, NgModule } from '@angular/core';
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
import { UserProfileModule } from '../user-profile/user-profile.module';
import { LayoutDefaultComponent } from './layout-default.component';


@NgModule({
    imports: [
        SharedModule,
        NavModule,
        UserProfileModule,
        TranslationModule,
        LocalizationModule],
    declarations: [LayoutDefaultComponent],
    exports: [LayoutDefaultComponent],
})

export class LayoutsModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/app/layout-default-' },
        );
        this.l10nLoader.load();
    }
}