import 'rxjs';
import { Repository, Filter, PutResult } from './pouch-repository';

const CLASS = "RepositoryOfSingletonDocument";

export class RepositoryOfSingletonDocument<T extends pouchDB.IBaseDoc> extends Repository<T> {
    constructor(
        entityName: string,
        idFieldName: string = 'Id') {
        super(entityName, idFieldName);
    }

    protected async getSingletonDocument(): Promise<IDocWithItems<T>> {
        this.logger.log(CLASS + ".getSingletonDocument");
        let doc: IDocWithItems<T>;
        try {
            doc = await this.db.get<IDocWithItems<T>>(this.entityName);
            this.logger.log(CLASS + ".getSingletonDocument/found");
            var res: PouchRes.IOk = {
                ok: true,
                id: doc._id,
                rev: doc._rev
            };
        }
        catch (err) {
            if (err.status === 404) {
                this.logger.log(CLASS + ".getSingletonDocument/missing => create");
                doc = {
                    _id: this.entityName,
                    "Items": new Array(),
                    _rev: null
                }
                await this.db.put(doc);
            }
            else {
                throw (err);
            }
        }
        this.logger.log(CLASS + ".getSingletonDocument/success");
        if (res) doc._rev = res.rev;
        return doc;
    }

    public async clearSingletonDocumentItems(): Promise<PouchRes.IOk> {
        this.logger.log(CLASS + ".clearSingletonDocumentItems");

        let doc = await this.getSingletonDocument();
        this.logger.log(CLASS + ".clearSingletonDocumentItems/document loaded");
        doc.Items = [];
        return await this.db.put(doc);
    }

    public async delete(ids: Array<string>): Promise<number> {
        this.logger.log(CLASS + ".delete");

        if (ids.length > 0) {
            this.logger.log(CLASS + ".delete/num to delete:" + ids.length);
            let document = await this.getSingletonDocument();
            this.logger.log(CLASS + ".delete/loaded: " + document.Items.length);
            for (var idToDelete of ids) {
                document.Items.splice(document.Items.indexOf(document.Items.find(d => d[this.idFieldName] == idToDelete)), 1);
            };
            let value = await this.db.put(document);
            this.logger.log(CLASS + ".delete/success deleted: " + ids.length);
            return ids.length;
        }
        else {
            this.logger.log(CLASS + ".delete/nothing to delete");
            return 0;
        }
    }

    public async getAll(filters?: Array<Filter>): Promise<Array<T>> {
        let doc = await this.getSingletonDocument();
        let result = doc.Items;
        if (filters && filters.length > 0) {
            result = doc.Items.filter((item: T) => {
                return filters.every(f => item[f.name] == item[f.value]);
            });
        }
        return this.autoConvertIsoToDate(result);
    }

    public async getAllIds(): Promise<Array<string>> {
        let doc = await this.getSingletonDocument();
        return doc.Items.map(item => item[this.idFieldName]);
    }

    public async get(id: string): Promise<T> {
        let items = await this.getItemsByIds([id]);
        return items.length > 0 ? this.autoConvertIsoToDate(items[0]) : null;
    }

    public async getItemsByIds(ids: Array<string>): Promise<Array<T>> {
        let docWithItems = await this.getSingletonDocument();
        if (!docWithItems && docWithItems.Items == undefined) throw (CLASS + ".getItemById: docWithItems is undefined or has no Items");
        let filteredItems = docWithItems.Items.filter((item => { return ids.indexOf(item[this.idFieldName]) >= 0 }));
        return this.autoConvertIsoToDate(filteredItems);
    }

    public async clear(): Promise<number> {
        this.logger.log(CLASS + ".clear");
        let doc = await this.getSingletonDocument();
        this.logger.log(CLASS + ".clear/loaded for update");
        let count = doc.Items.length;
        doc.Items = [];
        let putResult = await this.db.put(doc);
        return (putResult && putResult.ok) ? doc.Items.length : 0;
    }

    public async clearAndSave(dataItems: Array<T>): Promise<number> {
        this.logger.log(CLASS + ".clearAndSave");
        let doc = await this.getSingletonDocument();
        this.logger.log(CLASS + ".clearAndSave/loaded for update");
        doc.Items = [];
        if (dataItems && dataItems.length > 0) {
            for (var entry of dataItems) {
                doc.Items.push(entry);
            }
            let putResult = await this.db.put(doc);
            return (putResult && putResult.ok) ? dataItems.length : 0;
        }
        else {
            this.logger.log(CLASS + ".clearAndSave/data is empty");
            return 0;
        }
    }

    public async put(dataItems: Array<T>): Promise<PutResult>;
    public async put(data: T): Promise<PutResult>;
    public async put(arg1: any): Promise<PutResult> {

        let doc = await this.getSingletonDocument();
        this.logger.log(CLASS + ".clearAndSave/loaded for update");

        let putItems: Array<T> = Array.isArray(arg1) ? arg1 : [arg1];

        for (var putItem of putItems) {
            let existingItem = doc.Items.find(item => item[this.idFieldName] == putItem[this.idFieldName]);
            if (existingItem != null) {
                doc.Items.splice(doc.Items.indexOf(existingItem, 1));
            }
            doc.Items.push(putItem);
        }
        let putResult = new PutResult();
        try {
            await this.db.put(doc);
            putResult.successDocs = [doc];
        }
        catch (err) {
            putResult.successDocs = [];
            putResult.error = err;
        }
        return putResult;
    }
}

export interface IDocWithItems<T> extends pouchDB.IBaseDoc {
    Items: Array<T>;
}