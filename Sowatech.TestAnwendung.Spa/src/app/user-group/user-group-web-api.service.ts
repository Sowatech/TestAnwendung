import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WebApiServiceWithToken, WebApiSettingsService } from '../web-api/web-api.module';
import { LoggerService, Session } from '../shared';
import { UserGroupDto, UpdateUserGroupDto, InsertUserGroupDto } from './user-group.dtos';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserGroupWebApiService extends WebApiServiceWithToken {
    constructor(
        http: HttpClient,
        settings: WebApiSettingsService,
        public session: Session,
        logger: LoggerService) {
        super(http, settings, session, "UserGroup", logger);
    }

    getUserGroups(): Promise<Array<UserGroupDto>> {
        this.logger.log("UserGroupWebApiService.getUserGroups");
        return this.getRequest("GetUserGroups").params({ clientId: this.session.Data.client_id }).executeGetJson<Array<UserGroupDto>>();
    }

    getAvailableRoles(): Promise<Array<string>> {
        this.logger.log("UserGroupWebApiService.getAvailableRoles");
        return this.getRequest("GetAvailableRoles").executeGetJson<Array<string>>();
    }

    getAdd(): Promise<InsertUserGroupDto> {
        this.logger.log("UserGroupWebApiService.getAdd");
        return this.getRequest("GetAdd").params({ clientId: this.session.Data.client_id }).executeGetJson<InsertUserGroupDto>();
    }

    add(dto: InsertUserGroupDto): Promise<number> {
        this.logger.log("UserGroupWebApiService.add");
        return this.postRequest("Add").json(dto).executeGetJson<number>();
    }

    getUpdate(id: number): Promise<UpdateUserGroupDto> {
        this.logger.log("UserGroupWebApiService.getUpdate");
        return this.getRequest("GetUpdate").params({ userGroupId: id }).executeGetJson<UpdateUserGroupDto>();
    }

    update(dto: UpdateUserGroupDto): Promise<void> {
        this.logger.log("UserGroupWebApiService.update");
        return this.postRequest("Update").json(dto).execute();
    }

    duplicate(dto: UpdateUserGroupDto): Promise<number> {
        this.logger.log("UserGroupWebApiService.duplicate");
        return this.postRequest("Duplicate").json(dto).executeGetJson<number>();
    }

    delete(id: number): Promise<void> {
        this.logger.log("UserGroupWebApiService.delete");
        return this.postRequest("Delete").params({ id: id }).execute();
    }
    
}

