import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AuthGuard, AuthService } from './auth';
import { GlobalModule } from './global/global.module';
import { NavDataService } from './nav/nav-data.service';
import { NavService } from './nav/nav.service';
import { CsvService, GenericEditDialogService, LoggerService, MessageBoxService, Session } from './shared';
import { FileService, ZipService } from './shared/utilities';
import { UtilitiesModule } from './shared/utilities/utilities.module';
import { WebApiSettingsService } from './web-api/web-api-settings.service';
import { WebApiModule } from './web-api/web-api.module';

 
@NgModule({
    imports: [
        HttpModule,
        CommonModule,//?
        RouterModule,//?
        WebApiModule,
        UtilitiesModule,
        GlobalModule,
    ],
    providers: [
        LoggerService,
        Session,
        NavDataService,
        NavService,
        MessageBoxService,
        GenericEditDialogService,
        WebApiSettingsService,
        AuthService,
        AuthGuard,
        CsvService,
        FileService,
        ZipService
    ]
})
export class CoreModule {
}
 