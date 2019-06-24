import { LoggerService, Session, SessionDataDto } from '../shared';
import { WebApiSettingsService } from './web-api-settings.service';
import { HttpClient } from '@angular/common/http';
import { WebApiServiceWithTanBase } from '@sowatech/webapiservices';


export abstract class WebApiServiceWithTan extends WebApiServiceWithTanBase<SessionDataDto, Session> {
    constructor(
        http: HttpClient,
        protected settings: WebApiSettingsService,
        session: Session,
        controller: string,
        logger: LoggerService) {
        super(http, settings, session, controller, logger)
    }
}
