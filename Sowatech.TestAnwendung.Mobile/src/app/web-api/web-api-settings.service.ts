import { Injectable } from '@angular/core';

import { LoggerService } from '../shared';

@Injectable()
export class WebApiSettingsService {
    constructor(private loggerService: LoggerService) {
    }

    getBaseUrl(): string {
        let result: string;
        if (!window.location.origin) {
            //IE Fix (https://tosbourn.com/a-fix-for-window-location-origin-in-internet-explorer/)
            result = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        }
        else {
            result = window.location.origin + "/";
        }
        if (result.includes("localhost")) {
            result = "https://localhost:44387/"; 
        }
        return result;
    }

    private _accessToken: string;

    public set accessToken(accessToken: string) {
        this._accessToken = accessToken;
        localStorage.setItem(WEBAPISETTINGS_ACCESSTOKEN, accessToken);
    }

    public get accessToken(): string {
        if (!this._accessToken) {
            this._accessToken = localStorage.getItem(WEBAPISETTINGS_ACCESSTOKEN);
        }
        return this._accessToken;
    }

	private _refreshToken: string;

	public set refreshTokenId(refreshToken: string) {
		this._refreshToken = refreshToken;
		localStorage.setItem(WEBAPISETTINGS_REFRESHTOKEN, refreshToken);
	}

	public get refreshTokenId(): string {
		if (!this._refreshToken) {
			this._refreshToken = localStorage.getItem(WEBAPISETTINGS_REFRESHTOKEN);
		}
		return this._refreshToken;
	}

    private isValidString(s: string): boolean {
        return s != undefined && s != "";
    }

    public get hasCredentials(): boolean {
        return this.isValidString(this.accessToken);// || this.isValidString(this.userName) && this.isValidString(this.password);
    }

    private _tanNumber: string;
    public set tanNumber(tan: string) {
        this._tanNumber = tan;
        localStorage.setItem(WEBAPISETTINGS_TAN, tan);
    }

    public get tanNumber(): string {
        if (!this._tanNumber) {
            this._tanNumber = localStorage.getItem(WEBAPISETTINGS_TAN);
        }
        return this._tanNumber;
    }

    public removeCredentials() {
        this.loggerService.log("WebApiSettingsService.removeCredentials");
        this.accessToken = "";
        this.tanNumber = "";
    }
}

//const WEBAPISETTINGS_USERNAME = 'WebApiSettings.userName';
//const WEBAPISETTINGS_PASSWORD = 'WebApiSettings.password';
const WEBAPISETTINGS_REFRESHTOKEN = 'WebApiSettings.refreshToken';
const WEBAPISETTINGS_ACCESSTOKEN = 'WebApiSettings.accessToken';
const WEBAPISETTINGS_TAN = 'WebApiSettings.tan';
