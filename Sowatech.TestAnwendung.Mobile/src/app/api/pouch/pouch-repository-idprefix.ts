import { Repository, Filter, PutResult, PouchDocumentId } from './pouch-repository';
import { ThrowStmt } from '@angular/compiler';

const CLASS = "RepositoryWithIdPrefix";

export class RepositoryWithIdPrefix<T extends pouchDB.IBaseDoc> extends Repository<T> {

    constructor(
        entityName: string,
        idFieldName: string = 'Id',
        protected blobFields: Array<string> = null) {
        super(entityName, idFieldName);
    }

    protected getPouchDocumentId(id: string): PouchDocumentId {
        let docId = this.entityName + "-" + id; //`${this.entityName}-${id}`;
        return docId;
    }

    protected getId(docId: PouchDocumentId): string {
        let idStartIndex = docId.indexOf('-') + 1;
        return docId.slice(idStartIndex);
    }

    public async getAllIds(): Promise<Array<string>> {
        this.logger.log(CLASS + ".getAllIds");

        let fetchOptions: PouchOpt.IBatchFetch = {
            include_docs: false,
            startkey: this.entityName,
            endkey: this.entityName + "-" + '\uffff',
            attachments: true
        }

        let res = await this.db.allDocs<any>(fetchOptions);
        this.logger.log(CLASS + ".getAllIds/success");
        let resultIds = new Array<string>();
        for (var batchdoc of res.rows) {
            var docId = batchdoc.id;
            var id = this.getId(docId);
            resultIds.push(id);
        }
        return resultIds;
    }

    public async delete(ids: Array<string>): Promise<number> {
        this.logger.log(CLASS + ".delete");
        if (ids.length == 0) {
            this.logger.log(CLASS + ".delete/nothing to delete");
            return null;
        }
        else {
            let countSuccess = 0;
            for (var id of ids) {
                let pouchResOk = await this.deleteDocument(id);
                if (pouchResOk && pouchResOk.ok) {
                    countSuccess++;
                }
                else {
                    this.logger.warn(CLASS + ".delete/unsuccesfull for id=" + id);
                }
            }
            return countSuccess;
        }
    }

    public async clear(): Promise<number> {
        this.logger.log(CLASS + ".clear");
        let resultIds = await this.getAllIds();
        this.logger.log(CLASS + ".clear/getAllIds success");
        return this.delete(resultIds)
    }

    protected async deleteDocument(id: string): Promise<PouchRes.IOk> {
        this.logger.log(CLASS + ".deleteDocument");
        let docId = this.getPouchDocumentId(id);
        let doc = await this.db.get<pouchDB.IBaseDoc>(docId);
        this.logger.log(CLASS + ".delete/get");
        return this.db.remove(doc);
    }

    public async hasDocument(id: string): Promise<boolean> {
        this.logger.log(CLASS + ".hasDocument");

        let docId = this.getPouchDocumentId(id);
        try {
            let doc = await this.db.get<pouchDB.IBaseDoc>(docId);
            this.logger.log(CLASS + ".hasDocument/found");
            return true;
        }
        catch (err) {
            this.logger.log(CLASS + ".hasDocument/not found");
            return false;
        }
    }

    private async dbGet(docId: string, fetchOptions: PouchOpt.IBatchFetch = { attachments: true }): Promise<{ document: T, error: object }> {
        this.logger.log(CLASS + ".dbGet");
        try {
            let res = await this.db.get<T>(docId, fetchOptions);
            return { document: res, error: null };
        }
        catch (err) {
            return { document: null, error: err };
        }
    }

    public async get(id: string): Promise<T> {
        this.logger.log(CLASS + ".get");

        var docId = this.getPouchDocumentId(id);
        let fetchOptions: PouchOpt.IBatchFetch = {
            attachments: true
        };

        try {
            let result = await this.dbGet(docId, fetchOptions);
            if (!result.error) {
                let document = result.document;
                if (this.blobFields && this.blobFields.length > 0) this.fillBlobFieldFromAttachment(document);
                this.logger.log(CLASS + ".get/success");
                return (this.autoConvertIsoToDate(document));
            }
            else {
                if (result.error["status"] === 404) {
                    this.logger.warn(CLASS + ".get/is missing id=" + id);
                    return null;
                }
                else {
                    this.logger.error(JSON.stringify(result.error));
                    return null;
                }
            }
        }
        catch (err) {
            this.logger.error(err);
            return null;
        }
    }

    //Warnung: Inperformante Operation! Deserialisiert alle Documents, um Filter anzuwenden
    public async getAll(filters?: Array<Filter>): Promise<Array<T>> {
        this.logger.log(CLASS + ".getAll");

        var fetchOptions: PouchOpt.IBatchFetch = {
            include_docs: true,
            startkey: this.entityName,
            endkey: this.entityName + "-" + '\uffff',
            attachments: true
        }
        let res = await this.db.allDocs<any>(fetchOptions);
        this.logger.log(CLASS + ".getAll/success");
        var documents: Array<T> = [];
        for (var r of res.rows) {
            if (!filters || filters.every(f => r.doc[f.name] && r.doc[f.name] == f.value)) {
                this.autoConvertIsoToDate(r.doc);
                if (this.blobFields && this.blobFields.length > 0) this.fillBlobFieldFromAttachment(r.doc);
                documents.push(r.doc);
            }
        }
        return documents;
    }

    public async getItemsByIds(ids: Array<string>): Promise<Array<T>> {
        let resultItems = new Array<T>();
        for (let id of ids) {
            let doc = await this.get(id);
            resultItems.push(doc);
        }
        return resultItems;
    }

    private createDocumentFromData(src: T, documentId: string, rev: string = null): pouchDB.IBaseDoc {
        let dest: pouchDB.IBaseDoc = {
            ...<object>src,
            _id: documentId,
            _rev: rev
        };
        return dest;
    }

    protected writeDataToBaseDoc(src: T, dest: pouchDB.IBaseDoc): pouchDB.IBaseDoc {
        let _id = dest ? dest._id : null;
        let _rev = dest ? dest._rev : null;
        dest = {
            ...<object>src,
            _id: _id,
            _rev: _rev
        };
        return dest;
    }

    public async put(dataItems: Array<T>): Promise<PutResult>;
    public async put(data: T): Promise<PutResult>;
    public async put(arg1: any): Promise<PutResult> {
        this.logger.log(CLASS + ".put");
        let dataItems: Array<T> = (Array.isArray(arg1)) ? arg1 : [arg1];
        let putResult = new PutResult();
        putResult.successDocs = new Array<pouchDB.IBaseDoc>();

        for (let dataItem of dataItems) {
            this.logger.log(CLASS + ".dbPut/dataItem");
            let docId = this.getPouchDocumentId(dataItem[this.idFieldName].toString());
            let docGetResult = await this.dbGet(docId);
            this.logger.log(CLASS + ".dbPut/get existing");
            let separatedData = this.separateBlobData(dataItem);
            let baseDoc: pouchDB.IBaseDoc =
                (docGetResult.error && docGetResult.error["status"] === 404) ?
                    this.createDocumentFromData(separatedData.dataWithoutBlob, docId) :
                    <any>docGetResult.document;
            baseDoc = this.writeDataToBaseDoc(separatedData.dataWithoutBlob, baseDoc);
            try {
                if (separatedData.blobData) {
                    baseDoc["_attachments"] = {};
                    for (let blobField of this.blobFields) {
                        baseDoc["_attachments"][blobField] = {
                            "content_type": "text/plain",
                            "data": btoa(separatedData.blobData[blobField])
                        };
                    }
                }
                let resok = await this.db.put(baseDoc);
                this.logger.log(CLASS + ".dbPut/success");
                if (resok.ok && separatedData.blobData) {
                    for (let blobField of this.blobFields) {
                        this.logger.log(CLASS + ".put/start save blob " + blobField);
                        var attachment = new Blob([separatedData.blobData[blobField]], { type: 'text/plain' })
                        await this.db.putAttachment(docId, blobField, resok.rev, attachment, "text/plain");//text/plain wg. base64
                    }
                }
                putResult.successDocs.push(baseDoc);
            }
            catch (err) {
                this.logger.error(CLASS + ".dbPut/error");
                putResult.error = err;
                break;
            }
        }
        return putResult;
    }

    private fillBlobFieldFromAttachment(document: any) {
        for (let blobField of this.blobFields) {
            let isStoredAsBlob = blobField && !document[blobField];//false=kein blob oder old version ohne blob
            if (isStoredAsBlob) {
                let blobDataAsBase64 = this._readAndRemoveDataFrom_attachments(document, blobField);
                document[blobField] = blobDataAsBase64[blobField];
            }
        }
    }

    private _readAndRemoveDataFrom_attachments(document: any, blobField: string) {
        if (!document._attachments) {
            this.logger.warn(CLASS + ".loadDocument/load attachment : missing property _attachment in result");
            this.logger.warn(document);
            return null;
        }
        let result: Object = {}
        if (!document._attachments[blobField]) {
            this.logger.warn(CLASS + ".loadDocument/load attachment : _attachment in result has no field " + blobField);
            this.logger.warn(document);
            return null;
        }
        result[blobField] = atob(document._attachments[blobField].data);
        // result[blobField] = document._attachments[blobField].data;
        document._attachments[blobField].data = null;
        return result;
    }

    private separateBlobData(data: T): { dataWithoutBlob: T, blobData: Object } {
        let dataWithoutBlob: T = <T>{ ...<Object>data };
        let blobData = null;
        let hasBlobFields = this.blobFields && this.blobFields.length > 0;
        if (hasBlobFields) {
            blobData = {};
            for (let blobField of this.blobFields) {
                blobData[blobField] = data[blobField];
                dataWithoutBlob[blobField] = null;
            }
        }
        return { dataWithoutBlob: dataWithoutBlob, blobData: blobData };
    }
}
