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
import { ClientCrudService } from './client-crud.service';
import { ClientDetailComponent } from './client-detail/client-detail.component';
import { ClientListComponent } from './client-list/client-list.component';
import { CrudService } from './client-users/client-users-crud.service';
import { ClientUsersComponent } from './client-users/client-users.component';
import { ClientWebApiService } from './client-web-api.service';
import { clientRouting } from './client.routing';

@NgModule({
    imports: [
        SharedModule,
        clientRouting,
        TranslationModule,
        LocalizationModule],
    declarations: [
        ClientListComponent,
        ClientDetailComponent,
        ClientUsersComponent
    ],
    providers: [ClientWebApiService, ClientCrudService, CrudService]
})
export class ClientModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/app/client-list-' },
        );
        this.l10nLoader.load();
    }
}