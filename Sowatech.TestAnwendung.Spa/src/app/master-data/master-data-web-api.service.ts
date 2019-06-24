import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WebApiServiceWithToken, WebApiSettingsService } from '../web-api/web-api.module';
import { LoggerService, Session, ListEditorWebApiService } from '../shared';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MasterDataWebApiService extends WebApiServiceWithToken {
    constructor(
        http: HttpClient,
        settings: WebApiSettingsService,
        session: Session,
        logger: LoggerService) {
        super(http, settings, session, "MasterData", logger);
        this.categoryWebApiService = new CategoryWebApiService(this);
    }

    //--- category

    categoryWebApiService: ListEditorWebApiService<CategoryDto>;

    getListCategory(): Promise<Array<CategoryDto>> {
        this.logger.log("MasterDataWebApiService.getListCategory");
        return this.getRequest('GetListCategory').executeGetJson<Array<CategoryDto>>();
    }

    updateCategory(dto: CategoryDto): Promise<void> {
        this.logger.log("MasterDataWebApiService.updateCategory");
        return this.postRequest('UpdateCategory').json(dto).execute();
    }

    insertCategory(dto: CategoryDto): Promise<number> {
        this.logger.log("MasterDataWebApiService.insertCategory");
        return this.postRequest('InsertCategory').json(dto).executeGetJson<number>();
    }

    deleteCategory(id: number): Promise<void> {
        this.logger.log("MasterDataWebApiService.deleteCategory");
        return this.postRequest('DeleteCategory').params({ id: id }).execute();
    }
}

abstract class SubWebApiServiceBase implements ListEditorWebApiService<any> {
    getList(): Promise<Array<any>> { return null };
    update(dto: any): Promise<void> { return null };
    insert(dto: any): Promise<any> { return null };
    delete(id: any): Promise<void> { return null };
}

export class CategoryWebApiService extends SubWebApiServiceBase implements ListEditorWebApiService<CategoryDto> {

    constructor(master: MasterDataWebApiService) {
        super();
        this.getList = () => master.getListCategory();
        this.delete = (id) => master.deleteCategory(id);
        this.insert = (dto) => master.insertCategory(dto);
        this.update = (dto) => master.updateCategory(dto);
    }
}

class NameDto {
    public id: number;
    public name: string;
}

export class CategoryDto extends NameDto {
    public orderValue: string;
}
