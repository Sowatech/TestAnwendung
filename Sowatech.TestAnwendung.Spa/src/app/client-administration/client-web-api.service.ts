import { Injectable } from '@angular/core';
import { WebApiServiceWithToken, WebApiSettingsService } from '../web-api/web-api.module';
import { LoggerService, Session } from '../shared';

import { UserDto, AddUserDto, AddUserParams, UpdateUserDto, UpdateUserParams, SetPasswordParams, IdentityResultDto } from './client-users/client-users.dtos';
import { ClientListDto, ClientDto, InsertClientDto, UpdateClientDto, InsertResult  } from './client.dtos';
import { HttpClient } from '@angular/common/http';

//-- export ----------
export { UserDto, AddUserDto, AddUserParams, UpdateUserDto, UpdateUserParams, SetPasswordParams, IdentityResultDto } from './client-users/client-users.dtos';
export { ClientListDto, ClientDto, InsertClientDto, UpdateClientDto, } from './client.dtos';


@Injectable()
export class ClientWebApiService extends WebApiServiceWithToken {
    constructor(
        http: HttpClient,
        settings: WebApiSettingsService,
        session: Session, logger: LoggerService) {
        super(http, settings, session, "ClientAdministration", logger);
    }

    getList(): Promise<Array<ClientListDto>> {
        this.logger.log("ClientWebApiService.getList");
        return this.getRequest('List').executeGetJson<Array<ClientListDto>>();
    }

    getDetail(id: number): Promise<ClientDto> {
        this.logger.log("ClientWebApiService.getDetail");
        return this.getRequest('Detail').params({ id: id }).executeGetJson<ClientDto>();
    }

    getUpdate(id: number): Promise<UpdateClientDto> {
        this.logger.log("ClientWebApiService.getUpdate");
        return this.getRequest('GetUpdate').params({ id: id }).executeGetJson<UpdateClientDto>();
    }

    update(dto: UpdateClientDto): Promise<void> {
        this.logger.log("ClientWebApiService.update");
        return this.postRequest('Update').json(dto).execute();
    }

    insert(dto: InsertClientDto): Promise<InsertResult> {
        this.logger.log("ClientWebApiService.insert");
        return this.postRequest('Insert').json(dto).executeGetJson<InsertResult>();
    }

    deleteClient(clientId: number): Promise<void> {
        this.logger.log("UserWebApiService.deleteClient");
        return this.postRequest('DeleteClient').params({ clientId: clientId }).execute();
    }
        
    //--client users

    getUsers(clientId: number): Promise<Array<UserDto>> {
        this.logger.log("UserWebApiService.getUsers");
        return this.getRequest('GetUsers').params({ clientId: clientId}).executeGetJson<Array<UserDto>>();
    }

    getAddUser(clientId: number): Promise<AddUserDto> {
        this.logger.log("UserWebApiService.getAddUser");
        return this.getRequest('GetAddUser').params({ clientId: clientId }).executeGetJson<AddUserDto>();
    }

    addUser(parameters: AddUserParams): Promise<IdentityResultDto> {
        this.logger.log("UserWebApiService.addUser");
        return this.postRequest('AddUser').json(parameters).executeGetJson<IdentityResultDto>();
    }

    getUpdateUser(userName: string): Promise<UpdateUserDto> {
        this.logger.log("UserWebApiService.getUpdateUser");
        return this.getRequest('GetUpdateUser').params({ userName: userName }).executeGetJson<UpdateUserDto>();
    }

    updateUser(parameters: UpdateUserParams): Promise<void> {
        this.logger.log("UserWebApiService.updateUser");
        return this.postRequest('UpdateUser').json(parameters).execute();
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

