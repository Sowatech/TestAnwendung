import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UserSettingsUpdateParam } from "./user-settings/user-settings.dtos";
import 'rxjs/Rx';

import { WebApiServiceWithToken, WebApiSettingsService } from '../web-api/web-api.module';
import { LoggerService, Session } from '../shared';
import { ChangePasswordParameters, IdentityResultDto, UpdateUserProfileDto } from './user-profile.dtos';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserProfileWebApiService extends WebApiServiceWithToken {
    constructor(
        http: HttpClient,
        settings: WebApiSettingsService,
        session: Session, logger: LoggerService) {
        super(http, settings, session, "UserProfile", logger);
    }

    changePassword(parameters: ChangePasswordParameters): Promise<IdentityResultDto> {
        this.logger.log("UserProfileWebApiService.changePassword");
        return this.postRequest('ChangePassword').json(parameters).executeGetJson<IdentityResultDto>();
    }

    // getUserSettings(): Observable<UserSettingsDto> {
    //     this.logger.log("UserProfileWebApiService.getUserSettings");
    //     return this.getRequest("GetUserSettings").executeGetJson();
    // }

    updateUserSettings(updateParam: UserSettingsUpdateParam): Promise<void> {
        this.logger.log("UserProfileWebApiService.updateUserSettings");
        return this.postRequest("UpdateUserSettings").json(updateParam).execute();
    }

    getUpdateUserProfile(): Promise<UpdateUserProfileDto> {
        this.logger.log("UserProfileWebApiService.getUpdateUserProfile");
        return this.getRequest("GetUpdateUserProfile").executeGetJson<UpdateUserProfileDto>();
    }

    updateUserProfile(param: UpdateUserProfileDto): Promise<IdentityResultDto> {
        this.logger.log("UserProfileWebApiService.updateUser");
        return this.postRequest("UpdateUserProfile").json(param).executeGetJson<IdentityResultDto>();
    }
}