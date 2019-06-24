import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Session, SessionDataDto, LoggerService } from '../../shared';
import { LocalApiService } from '../../api';
import { WebApiSettingsService, WebApiServiceWithToken } from '../../web-api/web-api.module';

@Injectable()
export class LoginPageService extends WebApiServiceWithToken {
    constructor(
        protected http: Http,
        protected settings: WebApiSettingsService,
        protected session: Session,
        protected loggerService: LoggerService,
        protected localApiService: LocalApiService) {
        super(http, settings, session, "Account", loggerService);
    }

    login(username: string, password: string): Observable<SessionDataDto> {
        this.loggerService.log("LoginApiService.login");
        return super.doLogin(username, password);
    }

    logout(): Observable<void> {
        this.loggerService.log("LoginApiService.logout");
        return super.doLogout();
    }

    hasCredentials(): boolean {
        return this.settings.hasCredentials;
    }

    async clearData(): Promise<void> {
        this.loggerService.log("LoginPageService.clearData");
        return this.localApiService.clearAll();
    }
}