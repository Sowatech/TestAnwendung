import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { LoggerService, Session } from '../shared';
import { WebApiServiceWithToken, WebApiSettingsService } from '../web-api/web-api.module';

@Injectable()
export class WebApiService extends WebApiServiceWithToken {
    constructor(
        http: Http,
        settings: WebApiSettingsService,
        session: Session,
        loggerService: LoggerService
    ) {
        super(http, settings, session, "Mobile", loggerService);
    }
}