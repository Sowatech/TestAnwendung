import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
    L10nLoader,
    LocalizationModule,
    ProviderType,
    TRANSLATION_CONFIG,
    TranslationConfig,
    TranslationModule,
} from 'angular-l10n';

import { SharedModule } from '../shared/shared.module';
import { NavBreadcrumbComponent } from './nav-breadcrumb.component';
import { NavMenuComponent } from './nav-menu.component';
import { NavTitleComponent } from './nav-title.component';
import { NavBrowserTitleComponent } from './nav-browser-title.component';
import { NavWebApiService } from './nav-web-api.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        LocalizationModule,
        TranslationModule,
        SharedModule
    ],
    declarations: [NavMenuComponent, NavBreadcrumbComponent, NavTitleComponent,NavBrowserTitleComponent],
    exports: [NavMenuComponent, NavBreadcrumbComponent, NavTitleComponent,NavBrowserTitleComponent],
	providers: [NavWebApiService]
})
export class NavModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/app/nav-data-' },
        );
        this.l10nLoader.load();
    }
}
