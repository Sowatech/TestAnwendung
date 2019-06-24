import { Injectable } from '@angular/core';
import { LoggerService } from '../shared';
import { WebApiSettingsServiceBase } from '@sowatech/webapiservices';

@Injectable()
export class WebApiSettingsService extends WebApiSettingsServiceBase {
    constructor(loggerService: LoggerService) {
        super(loggerService);
    }
}
