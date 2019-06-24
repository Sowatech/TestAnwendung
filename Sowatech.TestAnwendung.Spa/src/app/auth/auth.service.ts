import { Injectable } from '@angular/core';
import { LoggerService, Session, SessionDataDto } from '../shared';
import { WebApiServiceWithToken, WebApiSettingsService } from '../web-api/web-api.module';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthService extends WebApiServiceWithToken {
    constructor(
        http: HttpClient,
        settings: WebApiSettingsService,
        session: Session,
        logger: LoggerService) {
        super(http, settings, session, "Account", logger);
    }

    redirectUrl: string;// store the URL so we can redirect after logging in

    login(username: string, password: string): Promise<SessionDataDto> {
        return super.doLogin(username, password);
    }

    logout(): Promise<void> {
        return super.doLogout();
    }

    testAuthentication(): Promise<void> {
        this.logger.log("WebApiService.testAuthentication");
        return this.getRequest('TestAuthentication').execute();
    }

    sendPwResetLinkMail(username: string): Promise<string> {
        this.logger.log("AuthService.sendPwResetLinkMail");
        return this.postRequest('SendPwResetLinkMail').params({ username: username }).executeGetJson();
    }
} 