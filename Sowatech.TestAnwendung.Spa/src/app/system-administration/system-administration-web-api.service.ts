import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WebApiServiceWithToken, WebApiSettingsService } from '../web-api/web-api.module';
import { LoggerService, Session } from '../shared';

import { SystemSettingsDto } from "./system-settings/system-settings.dtos";
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SystemAdministrationWebApiService extends WebApiServiceWithToken {
    constructor(
        http: HttpClient,
        settings: WebApiSettingsService,
        session: Session, logger: LoggerService) {
        super(http, settings, session, "SystemAdministration", logger);
    }

    getSystemSettings(): Promise<SystemSettingsDto> {
        this.logger.log("SystemAdministrationWebApiService.getClientSettings");
        return this.getRequest("GetSystemSettings").executeGetJson<SystemSettingsDto>();
    }

    updateSmtpAccount(updateParam: any): Promise<void> {
        this.logger.log("SystemAdministrationWebApiService.updateSmtpAccount");
        return this.postRequest("UpdateSmtpAccount").json(updateParam).execute();
    }

    sendTestMail(): Promise<string> {
        this.logger.log("SystemAdministrationWebApiService.sendTestMail");
        return this.postRequest("SendTestMail").executeGetJson<string>();
    }
}
