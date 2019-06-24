import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { L10nConfig, L10nLoader, LocalizationModule, StorageStrategy, TranslationModule } from 'angular-l10n';

import { AppComponent } from './app.component';
import { routing } from './app.routes';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client-administration/client.module';
import { ClientProfileModule } from './client-profile/client-profile.module';
import { CoreModule } from './core.module';
import { HomeModule } from './home/home.module';
import { LayoutsModule } from './layouts/layouts.module';
import { MasterDataModule } from './master-data/master-data.module';
import { SharedModule } from './shared/shared.module';
import { SystemAdminstrationModule } from './system-administration/system-administration.module';
import { UserModule } from './user-administration/user.module';
import { UserGroupModule } from './user-group/user-group.module';
import { UserProfileModule } from './user-profile/user-profile.module';

registerLocaleData(localeDe);

const l10nConfig: L10nConfig = {
    locale: {
        languages: [
            { code: 'de', dir: 'ltr' },
            { code: 'en', dir: 'ltr' }
        ],
        language: 'de',
        storage: StorageStrategy.Cookie
    },
    translation: {
        providers: [
        ],
        caching: true,
        missingValue: 'No key',
        composedKeySeparator: '.'
    }
};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        routing,
        BrowserModule,
        HttpClientModule,
        CoreModule,
        AuthModule,
        SharedModule,
        LayoutsModule,
        TranslationModule.forRoot(l10nConfig),
        LocalizationModule.forRoot(l10nConfig),
        HomeModule,
        ClientModule,
        ClientProfileModule,
        UserModule,
        UserGroupModule,
        UserProfileModule,
        SystemAdminstrationModule,
        MasterDataModule,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: LOCALE_ID, useValue: "de-DE" } //angular native localization
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(public loader: L10nLoader) {
        this.loader.load();
    }
}