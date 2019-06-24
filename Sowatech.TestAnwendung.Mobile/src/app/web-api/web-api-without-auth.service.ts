import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { LoggerService, Session, SessionDataDto } from '../shared';
import { WebApiSettingsService } from './web-api-settings.service';
import { HttpRequestBuilder, IWebApiServiceRequestBuilder } from './http-request-builder';



export abstract class WebApiServiceWithoutAuth {
    constructor(protected http: Http,
        protected settings: WebApiSettingsService,
        protected controller: string,
        protected logger: LoggerService) {
        this.baseUrl = settings.getBaseUrl() + controller + "/";
    }

    private baseUrl: string;

    protected request(): HttpRequestBuilder {
        return new HttpRequestBuilder(this.http, this.logger);
    }

    protected getRequest(method: string): IWebApiServiceRequestBuilder {
        return this.request().get(this.baseUrl + method);
    }
    protected postRequest(method: string): IWebApiServiceRequestBuilder {
        return this.request().post(this.baseUrl + method);
    }
}