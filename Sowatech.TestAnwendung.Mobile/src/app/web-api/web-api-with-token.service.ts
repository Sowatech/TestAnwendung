import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { WebApiSettingsService } from './web-api-settings.service';
import { LoggerService, Session, SessionDataDto } from '../shared';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { HttpRequestBuilder, IWebApiServiceRequestBuilder, THandleUnauthorized } from './http-request-builder';
import { HttpRequestBuilderWithToken, TAccessToken } from './http-request-builder-with-token';

export abstract class WebApiServiceWithToken {
    constructor(
        protected http: Http,
        protected settings: WebApiSettingsService,
        protected session: Session,
        protected controller: string,
        protected logger: LoggerService
    ) {
        this.baseUrl = settings.getBaseUrl() + controller + "/";
        this.loginUrl = settings.getBaseUrl() + "Token";
    }

    public get isLoggedIn(): boolean {
        return this.settings.hasCredentials;
    }

	public get hasToken(): boolean {
		return this.settings.hasCredentials;
	}

    private baseUrl: string;
    private loginUrl: string;

	protected doLogin(): Observable<SessionDataDto>;
	protected doLogin(username: string, password: string): Observable<SessionDataDto>;
	protected doLogin(arg1?: string, arg2?: string): Observable<SessionDataDto> {
		this.logger.log("WebApiServiceWithToken.doLogin");
		return this.internalLogin(arg1, arg2)
			.flatMap((token) => {
				this.logger.log("WebApiServiceWithToken.doLogin success GetSessionData");
				return this.getRequest("GetSessionData").executeGetJson();
			})
			.do((sessionData) => {
				this.logger.log("WebApiServiceWithToken.doLogin got session data");
				this.session.Data = sessionData;
			});
	}

	protected internalLogin(username: string, password: string): Observable<TAccessToken> {
		this.logger.log("WebApiServiceWithToken.internalLogin");
		return this.internalLoginCore(username, password);
	}

	private internalLoginCore(userName: string, password: string): Observable<TAccessToken> {
		this.logger.log("WebApiServiceWithToken.internalLoginCore");
		let params: URLSearchParams = new URLSearchParams();
		params.set("userName", encodeURIComponent(userName));
		params.set("password", encodeURIComponent(password));
		params.set("grant_type", "password");
		let body: string = params.toString();
		let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
		let options = new RequestOptions({ headers: headers });

		return this.http.post(this.loginUrl, body, options)
			.map((res: Response) => {
				this.logger.log("WebApiService.login got token");
				this.settings.accessToken = res.json().access_token;
				this.settings.refreshTokenId = res.json().refresh_token;
				return this.settings.accessToken;
			})
			.catch((error) => {
				this.logger.warn(error);
				this.removeCredentialsAndSession();
				return Observable.throw(error);
			});
	}

    protected doLogout(): Observable<void> {
        this.logger.log("WebApiService.doLogout");
        let result = this.request().post(this.settings.getBaseUrl() + 'Account/Logout').execute();
        //result.subscribe(
        //    () => {
        //        this.removeCredentialsAndSession();
        //    },
        //    (error) => {
        //        this.logger.warn(error);
        //        this.removeCredentialsAndSession();
        //    }
        //)
        return result;
    }

    protected request(): HttpRequestBuilder {
        return new HttpRequestBuilderWithToken(this.http, this.logger, (requestBuilder: HttpRequestBuilderWithToken) => this.tokenExpired(requestBuilder))
            .setBearerToken(this.getToken());
    }

    private tokenExpired(requestBuilder: HttpRequestBuilderWithToken): THandleUnauthorized {
		let handleUnauthorized: THandleUnauthorized = null;
		if (this.settings.refreshTokenId != null) {
			handleUnauthorized = "RETRY";
			requestBuilder.setBearerToken(this.refreshAccessTokenCore());
		} else {
			handleUnauthorized = "CANCEL";
		}
		return handleUnauthorized;
    }

    private getToken(): Observable<TAccessToken> {
            return Observable.of(this.settings.accessToken);
    }

    private removeCredentialsAndSession() {
        this.settings.removeCredentials();
        this.session.clearData();
    }

    protected getRequest(method: string): IWebApiServiceRequestBuilder {
        return this.request().get(this.baseUrl + method);
    }

    protected postRequest(method: string): IWebApiServiceRequestBuilder {
        return this.request().post(this.baseUrl + method);
	}

	private refreshAccessTokenCore(): Observable<TAccessToken> {
		if (this.settings.refreshTokenId != "") {
			var token = this.session.getData();
			var data = "grant_type=refresh_token&refresh_token=" + encodeURIComponent(this.settings.refreshTokenId) + "&client_id=" + this.session.Data.client_id; //"&client_id=" + this.session.Data.client_id
			return this.http.post(this.loginUrl, data).map((res) => {
				this.settings.accessToken = res.json().access_token;
				this.settings.refreshTokenId = res.json().refresh_token;
				return this.settings.accessToken;
			}).catch((error) => {
				return Observable.throw(error);
			});
		} else {
			return Observable.of(this.settings.accessToken);
		}
	}
}


