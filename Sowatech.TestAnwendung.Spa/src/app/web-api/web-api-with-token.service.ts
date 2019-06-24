import { WebApiSettingsService } from './web-api-settings.service';
import { LoggerService, Session, SessionDataDto } from '../shared';
import { HttpClient } from '@angular/common/http';
import { WebApiServiceWithTokenBase } from '@sowatech/webapiservices';

export abstract class WebApiServiceWithToken extends WebApiServiceWithTokenBase<SessionDataDto, Session> {
    constructor(
        http: HttpClient,
        protected settings: WebApiSettingsService,
        session: Session,
        controller: string,
        logger: LoggerService
    ) {
        super(http, settings, session, controller, logger);
    }
}


