import { NgModule, Inject } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { userGroupRouting } from './user-group.routing';

import { UserGroupComponent } from './user-group.component';
import { UserGroupWebApiService } from './user-group-web-api.service';
import { DialogUserGroupService } from './dialogs/dialog-user-group';
import { UserGroupCrudService } from './user-group-crud.service';
import { L10nLoader, TRANSLATION_CONFIG, TranslationConfig, ProviderType } from 'angular-l10n';

@NgModule({
    imports: [
        SharedModule,
        userGroupRouting
    ],
    declarations: [
        UserGroupComponent,
    ],
    providers: [UserGroupWebApiService, DialogUserGroupService, UserGroupCrudService]
})
export class UserGroupModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/app/user-group-' },
        );
        this.l10nLoader.load();
    }
}
