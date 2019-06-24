import { Injectable } from '@angular/core';
import { LoggerService, Session } from '../shared';
import { WebApiServiceWithToken, WebApiSettingsService, WebApiServiceWithoutAuth } from '../web-api/web-api.module';
import { NavItemsDto } from './nav.dtos';
import { HttpClient } from '@angular/common/http';



const CLASS = "NavWebApiService";

@Injectable()
export class NavWebApiService extends WebApiServiceWithoutAuth {
    constructor(
        http: HttpClient,
        settings: WebApiSettingsService,
        session: Session, logger: LoggerService) {
        //super(http, settings, session, "NavMenu", logger);
        super(http, settings, "NavMenu", logger);
    }

    getNavMenu(): Promise<NavItemsDto> {
        this.logger.log(CLASS + ".getNavMenu");
        return this.getRequest('GetNavMenu').executeGetJson<NavItemsDto>(); 
    }
}
