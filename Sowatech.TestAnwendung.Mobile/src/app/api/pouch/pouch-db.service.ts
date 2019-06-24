import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { LoggerService } from '../../shared';
import { RepositoryBase } from './pouch-repository';
import { Platform } from 'ionic-angular';
declare var require: any;

import PouchDB from 'pouchdb';
// var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite'));

const CLASS = "PouchDbService";

@Injectable()
export class PouchDbService {

    constructor(
        private logger: LoggerService,
        public platform: Platform
    ) {
    }

    private db: pouchDB.IPouchDB;
    private repositories: Array<RepositoryBase>;

    public initDatabase(databaseName: string, repositories?: RepositoryBase[]) {
        this.logger.log(CLASS + ".initDatabase");
        let dbOptions;// = { auto_compaction: true };//PouchOpt.IBase
        if (this.platform.is("android") || this.platform.is("ios")) {
            dbOptions = { auto_compaction: true, adapter: 'cordova-sqlite', iosDatabaseLocation: 'Library' }
        }
        else {
            dbOptions = { auto_compaction: true }
        }
        this.db = new PouchDB(databaseName, dbOptions);

        if (repositories) {
            this.addRepositories(repositories);
        }
    }

    private addRepositories(repositories: RepositoryBase[]) {
        this.repositories = repositories.slice(0);
        for (var r of this.repositories) {
            r.setDb(this.db);
            r.setLogger(this.logger);
        }
    }

    public getRepository(name: string): RepositoryBase {
        let result = this.repositories.find(r => r.entityName == name);
        if (!result) this.logger.warn(CLASS + ".getRepository. No Repository with name = " + name);
        return result;
    }

    public async clearDatabase(): Promise<void> {
        this.logger.log(CLASS + ".clearDatabase");

        //todo: bestimmte repositories erhalten (settings)
        //preserveRepositories: RepositoryOfSingletonDocument < any > []
        //for (let preserved of preserveRepositories) {
        //todo:save
        //}

        let dbName: string;

        let info = await this.getDatabaseInfo();
        dbName = info.db_name;
        await this.db.destroy();

        this.logger.log(CLASS + ".deleteDatabase/db destroyed");
        for (var repository of this.repositories) {
            repository.afterClearDatabase();
        }
        this.initDatabase(dbName, this.repositories); //TODO: Ek -> mit Peter klären??
        return;
    }

    public async getDatabaseInfo(): Promise<PouchRes.IInfo> {
        return this.db.info();
    }
}
