import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { LoggerService, Session, SessionDataDto } from '../shared';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { HttpRequestBuilder, IWebApiServiceRequestBuilder } from './http-request-builder';
import { HttpRequestBuilderWithTan } from './http-request-builder-with-tan';

import { WebApiSettingsService } from './web-api-settings.service';


export abstract class WebApiServiceWithTan {
    constructor(
        protected http: Http,
        protected settings: WebApiSettingsService,
        protected session: Session,
        protected controller: string,
        protected logger: LoggerService) {
        this.baseUrl = settings.getBaseUrl() + controller + "/";
    }

    private baseUrl: string;

    protected request(): HttpRequestBuilder {
        return new HttpRequestBuilderWithTan(this.http, this.logger).setTan(this.settings.tanNumber);
    }

    protected getRequest(method: string): IWebApiServiceRequestBuilder {
        return this.request().get(this.baseUrl + method);
    }
    protected postRequest(method: string): IWebApiServiceRequestBuilder {
        return this.request().post(this.baseUrl + method);
    }

    public get hasTan(): boolean {
        return this.settings.tanNumber != undefined && this.settings.tanNumber != null && this.settings.tanNumber.length > 0;
    }
}
