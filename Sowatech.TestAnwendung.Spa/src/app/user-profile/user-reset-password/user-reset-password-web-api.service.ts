import { Injectable } from '@angular/core';
import { WebApiSettingsService } from '../../web-api/web-api.module';
import { LoggerService, Session } from '../../shared';
import { ResetPasswordParameters } from '../user-profile.dtos';
import { HttpClient } from '@angular/common/http';
import { WebApiServiceWithoutAuth } from '@sowatech/webapiservices';

@Injectable()
export class ResetPasswordWebApiService extends WebApiServiceWithoutAuth {
    constructor(
        http: HttpClient,
        settings: WebApiSettingsService,
        session: Session, logger: LoggerService) {
        super(http, settings, "UserProfile", logger);
    }

    sendResetPasswordMail(username: string): Promise<void> {
        this.logger.log("UserProfileWebApiService.sendResetPasswordMail");
        return this.getRequest('SendResetPasswordMail').params({ username: username }).execute();
    }

    resetPassword(parameters: ResetPasswordParameters): Promise<void> {
        this.logger.log("UserProfileWebApiService.ResetPassword");
        return this.postRequest("ResetPassword").json(parameters).execute();
    }
}
