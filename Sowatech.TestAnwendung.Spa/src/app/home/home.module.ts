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
import { HomeComponent } from './home.component';
import { homeRouting } from './home.routing';
import { HomeService } from './home.service';

@NgModule({
    declarations: [HomeComponent],
    imports: [
        SharedModule,
        homeRouting,
        TranslationModule,
        LocalizationModule
    ],
    providers: [HomeService]
})



export class HomeModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/app/home-' },
        );
        this.l10nLoader.load();
    }
}