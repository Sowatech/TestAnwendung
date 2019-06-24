import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { SessionDataDto } from "../../session.dtos";
import { SessionBase } from '@sowatech/webapiservices';

@Injectable()
export class Session extends SessionBase<SessionDataDto> {
    constructor(loggerService: LoggerService) {
        super(loggerService);
    }
}
