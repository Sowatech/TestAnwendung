import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { LoggerService, Session } from '../shared';
import { WebApiServiceWithToken, WebApiSettingsService } from '../web-api/web-api.module';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HomeService extends WebApiServiceWithToken {
    constructor(
        http: HttpClient,
        settings: WebApiSettingsService,
        session: Session,
        logger: LoggerService) {
        super(http, settings, session, "Home", logger);
    }

    uploadDocuments(files: any): Promise<void> {
        this.logger.log("HomeService.uploadDocuments");
        //let headers = new Headers();
        //let options = new RequestOptions({ headers: headers });

        //let formData = new FormData();
        //formData.append("files", document)

        return this.postRequest("uploadDocuments").file(files).execute();
    }
} 