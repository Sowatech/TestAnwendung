import { Inject, Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
//import 'rxjs/Rx';
import { LoggerService } from '../../shared';

export abstract class RepositoryBase {

    constructor(
        public entityName: string
    ) {
    }

    public afterClearDatabase() { }

    protected db: pouchDB.IPouchDB;
    public setDb(db: pouchDB.IPouchDB) {
        this.db = db;
    }

    protected logger: LoggerService;
    public setLogger(logger: LoggerService) {
        this.logger = logger;
    }
}

export class PutResult{
    successDocs: Array<pouchDB.IBaseDoc>;
    error: object
}

export type PouchDocumentId = string;

export abstract class Repository<T> extends RepositoryBase {
    constructor(
        entityName: string,
        protected idFieldName: string = 'Id') {
        super(entityName);
    }

    public abstract get(id: string): Promise<T>;
    public abstract getAll(filters?: Array<Filter>): Promise<Array<T>>;

    public abstract delete(ids: Array<string>): Promise<number>;
    public abstract clear(): Promise<number>;
    public abstract put(data: Array<T>): Promise<PutResult>;
    public abstract put(data: T): Promise<PutResult>;
    public abstract getAllIds(): Promise<Array<string>>;

    protected autoConvertIsoToDate(object: any): any {
        try {
            if (Array.isArray(object)) {
                for (var item of <Array<any>>object) {
                    this.autoConvertIsoToDate(item);
                }
            }
            else {
                var isoregex = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
                for (var prop in object) {
                    if (typeof (object[prop]) === "object") {
                        this.autoConvertIsoToDate(object[prop]);
                    }
                    else {
                        if (typeof (object[prop]) === "string" && isoregex.test(object[prop])) {
                            let dateString = object[prop];
                            if (dateString.length <= 10) {
                                //date without time
                                //object[prop] = new DateWithoutTime(object[prop]);
                            }
                            else {
                                object[prop] = new Date(object[prop]);
                            }
                        }
                    }
                }
            }
        }
        catch (e) {
            this.logger.log("Repository.autoConvertIsoDateStringToDate/error:" + e);
            throw (e);
        }
        return object;
    }
}

export class Filter {
    name: string = null;
    value: string = null;
}