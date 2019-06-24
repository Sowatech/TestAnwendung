import { Injectable } from '@angular/core';
import { ClientSettingsDto, UpdateSmtpAccountParam, } from "./client-settings/client-settings.dtos";

import { WebApiServiceWithToken, WebApiSettingsService } from '../web-api/web-api.module';
import { LoggerService, Session } from '../shared';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ClientProfileWebApiService extends WebApiServiceWithToken {
    constructor(
        http: HttpClient,
        settings: WebApiSettingsService,
        session: Session, logger: LoggerService) {
        super(http, settings, session, "ClientProfile", logger);
    }

    getClientSettings(): Promise<ClientSettingsDto> {
        this.logger.log("ClientProfileWebApiService.getClientSettings");
        return this.getRequest("GetClientSettings").params({ clientId: this.session.Data.client_id }).executeGetJson<ClientSettingsDto>();
    }

    updateSmtpAccount(updateParam: UpdateSmtpAccountParam): Promise<void> {
        this.logger.log("ClientProfileWebApiService.updateSmtpAccount");
        updateParam.clientId = this.session.Data.client_id;
        return this.postRequest("UpdateSmtpAccount").json(updateParam).execute();
    }

    sendTestMail(): Promise<string> {
        this.logger.log("ClientProfileWebApiService.sendTestMail");
        return this.postRequest("SendTestMail").params({ clientId: this.session.Data.client_id }).executeGetJson<string>();
    }
}
