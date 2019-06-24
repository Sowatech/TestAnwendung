import { Observable } from 'rxjs/Observable';

export interface ListEditorWebApiService<T> {
    getList(): Promise<T[]>;
    update(updateItem: T): Promise<void>;
    insert(updateItem: T): Promise<any>;//expects new id as return value
    delete(id: any): Promise<void>;
}