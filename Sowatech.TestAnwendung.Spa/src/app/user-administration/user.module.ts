import { NgModule, Inject } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { useradminRouting } from './user.routing';
import { UserAdministrationComponent } from './user-administration.component';
import { UserWebApiService } from './user-web-api.service';
import { UserCrudService } from './user-crud.service';
import { TranslationModule, LocalizationModule, TranslationService, L10nLoader, TRANSLATION_CONFIG, TranslationConfig, ProviderType } from 'angular-l10n';

@NgModule({
    imports: [
        SharedModule,
        useradminRouting,
        TranslationModule,
        LocalizationModule
    ],
    declarations: [
        UserAdministrationComponent
        
    ],
    providers: [UserWebApiService, UserCrudService]
})
export class UserModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/app/user-administration-' },
        );
        this.l10nLoader.load();
    }
}
