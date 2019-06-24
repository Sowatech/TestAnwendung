import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { LocalApiService } from '../../api';
import { WebApiService } from '../../api';
import { LoggerService } from '../../shared';

@Injectable()
export class HomeApiService {
    constructor(
        private loggerService: LoggerService,
        private webApiService: WebApiService,
        private localApiService: LocalApiService
    ) {
    }
}