import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WebApiServiceWithToken, WebApiSettingsService } from '../web-api/web-api.module';
import { LoggerService, Session } from '../shared';
import { UserDto, AddUserDto, AddUserParams, UpdateUserDto, UpdateUserParams, SetPasswordParams, IdentityResultDto } from './user.dtos';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserWebApiService extends WebApiServiceWithToken {
    constructor(
        http: HttpClient,
        settings: WebApiSettingsService,
        session: Session, logger: LoggerService) {
        super(http, settings, session, "UserAdministration", logger);
    }

    getUsers(): Promise<Array<UserDto>> {
        this.logger.log("UserWebApiService.getUsers");
        return this.getRequest('GetUsers').executeGetJson<Array<UserDto>>();
    }

    getAddUser(): Promise<AddUserDto> {
        this.logger.log("UserWebApiService.getAddUser");
        return this.getRequest('GetAddUser').executeGetJson<AddUserDto>();
    }

    addUser(parameters: AddUserParams): Promise<IdentityResultDto> {
        this.logger.log("UserWebApiService.addUser");
        return this.postRequest('AddUser').json(parameters).executeGetJson<IdentityResultDto>();
    }

    getUpdateUser(userName: string): Promise<UpdateUserDto> {
        this.logger.log("UserWebApiService.getUpdateUser");
        return this.getRequest('GetUpdateUser').params({ userName: userName }).executeGetJson<UpdateUserDto>();
    }

    updateUser(parameters: UpdateUserParams): Promise<IdentityResultDto> {
        this.logger.log("UserWebApiService.updateUser");
        return this.postRequest('UpdateUser').json(parameters).executeGetJson<IdentityResultDto>();
    }

    deleteUser(userName: string): Promise<void> {
        this.logger.log("UserWebApiService.deleteUser");
        return this.postRequest('DeleteUser').params({ userName: userName }).execute();
    }

    setPassword(parameters: SetPasswordParams): Promise<IdentityResultDto> {
        this.logger.log("UserWebApiService.setPassword");
        return this.postRequest('SetPassword').json(parameters).executeGetJson<IdentityResultDto>();
    }

}