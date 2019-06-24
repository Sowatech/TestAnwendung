import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { LoggerService } from '../shared';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx'; // add all ; statt opertrator/map?
import { HttpRequestBuilder, THandleUnauthorized } from './http-request-builder';

export class HttpRequestBuilderWithToken extends HttpRequestBuilder {
    constructor(
        http: Http,
        logger: LoggerService,
        tokenExpired: (requestBuilder: HttpRequestBuilderWithToken) => any) {
        super(http, logger);
        this.tokenExpired = tokenExpired;
    }

    private tokenExpired: (requestBuilder: HttpRequestBuilderWithToken) => THandleUnauthorized;

    setBearerToken(token: Observable<TAccessToken>): HttpRequestBuilder {
        this.token = token;
        return this;
    }

    private token: Observable<TAccessToken>;

    protected internalExecuteWithLogin(expectsJsonResult: boolean): Observable<any> {
        if (this.token) {
            return this.token
                .flatMap((accessToken: TAccessToken) => {
                    if (accessToken) {
                        return this.internalExecute(expectsJsonResult, "Bearer " + accessToken)
                    }
                    else {
                        this.logger.log("HttpRequestBuilderWithToken.internalExecuteWithLogin/no access token");
                        return this.internalExecute(expectsJsonResult);
                    }
                }
                );
        }
        else {
            return this.internalExecute(expectsJsonResult);
        }
    }

    protected unAuthorized(): THandleUnauthorized {
        return this.tokenExpired(this);
    }
}

export type TAccessToken = string;