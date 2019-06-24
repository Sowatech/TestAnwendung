import {Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { LoggerService} from '../shared';

import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx'; // add all ; statt opertrator/map?
import {HttpRequestBuilder} from './http-request-builder';

export class HttpRequestBuilderWithTan extends HttpRequestBuilder {
    constructor(http: Http, logger: LoggerService) {
        super(http, logger);
    }

    setTan(tan: string): HttpRequestBuilder {
        this.tan = tan;
        return this;
    }

    private tan: string;

    protected internalExecuteWithLogin(hasResult: boolean): Observable<any> {
        if (this.tan) {
            return this.internalExecute(hasResult, "TAN " + this.tan);
        } else {
            return this.internalExecute(hasResult);
        }
    }
}
