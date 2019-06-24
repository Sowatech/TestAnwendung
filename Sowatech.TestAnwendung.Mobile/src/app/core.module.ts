import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { PouchDbService, LocalApiService, WebApiService } from './api';
import { UtilitiesModule, GuidService, LoaderService, LoggerService, Session, ImageService } from './shared';
import { WebApiSettingsService } from './web-api/web-api.module';

@NgModule({
    imports: [
        HttpModule, UtilitiesModule
    ],
    providers: [
        LoggerService,
        Session,
        GuidService,
        PouchDbService,
        LocalApiService,
        WebApiService,
        WebApiSettingsService,
        LoaderService,
        ImageService
    ]
})
export class CoreModule { }