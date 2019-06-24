import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { LoggerService } from '../shared';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx'; // add all ; statt opertrator/map?

export class HttpRequestBuilder implements IWebApiServiceRequestBuilder {
  constructor(private http: Http, protected logger: LoggerService) {
  }

  get(url: string): HttpRequestBuilder {
    this.url = url;
    this.usePost = false;
    return this;
  }

  post(url: string): HttpRequestBuilder {
    this.url = url;
    this.usePost = true;
    return this;
  }

  private url: string;
  private usePost: boolean = false;

  params(parameters: any): HttpRequestBuilder {
    this.parameters = parameters;
    return this;
  }

  private parameters: any;

  json(obj: any): HttpRequestBuilder {
    this.jsonObj = JSON.stringify(obj);
    return this;
  }
  private jsonObj: string = "";

  file(fileData: any): HttpRequestBuilder {
    this.fileData = fileData;
    return this;
  }

  private fileData: any;

  ErrorIsEnumWithUnkown(unknownError: any) {
    this.unknownError = unknownError;
  }
  private unknownError: any;

  execute(): Observable<any> {
    return this.internalExecuteWithLogin(false);
  }

  executeGetJson(): Observable<any> {
    return this.internalExecuteWithLogin(true);
  }
  protected internalExecuteWithLogin(expectsJsonResult: boolean): Observable<any> {
    return this.internalExecute(expectsJsonResult);
  }

  protected internalExecute(expectsJsonResult: boolean, authorization?: string): Observable<any> {
    let options = this.createRequestOptions(expectsJsonResult, authorization);
    let formData = this.createRequestFormData();
    let request = this.createRequest(options, formData);

    return request
      .map((res: Response) => {
        if (expectsJsonResult) {
          return this.autoConvertIsoToDate(res.json());
        }
        else {
          return;
        }
      })
      .catch((error) => {
        if (error.status && error.status == 401) {
          let result = this.unAuthorized();
          this.logger.log("HttpRequestBuilder.internalExecute/401 response: " + result);
          switch (result) {
            case "RETRY":
              return this.internalExecuteWithLogin(expectsJsonResult);
            case "CANCEL":
              let cancelError = new Error();
              cancelError.name = "Unauthorized: Unable to renew security token";
              cancelError.message = "Unable to renew security token: Canceled";
              cancelError["status"] = 401;
              return Observable.throw(cancelError);
            default:
              let defaultError = new Error("Unauthorized: " + result);
              defaultError["status"] = 401;
              return Observable.throw(defaultError);
          }
        }
        else {
          return Observable.throw(this.handleError(error));
        }
      });
  }

  private createRequestOptions(expectsJsonResult: boolean, authorization?: string): RequestOptions {
    let headers = this.createRequestHeaders(expectsJsonResult, authorization);
    let options: RequestOptions = new RequestOptions({ headers: headers });
    if (this.parameters) {
      let params: URLSearchParams = new URLSearchParams();
      for (var key in this.parameters) {
        params.set(key, this.getStringifiedValue(this.parameters[key]));
      }
      options.search = params;
    }
    return options;
  }

  private createRequestHeaders(expectsJsonResult: boolean, authorization?: string): Headers {
    let headers = new Headers();
    if (authorization !== undefined) {
      headers.append("Authorization", authorization);
    }
    if (this.jsonObj != "") {
      headers.append('Content-Type', 'application/json');
    }
    if (expectsJsonResult) {
      headers.append('Accept', 'application/json');
    }
    return headers;
  }

  private createRequestFormData(): FormData {
    let formData: FormData;
    if (this.fileData) {
      //headers.append('Content-Type', 'undefined');
      formData = new FormData();
      for (var key in this.fileData) {
        formData.append(key, this.fileData[key]);
      }
    }
    return formData;
  }

  private createRequest(options: RequestOptions, formData: FormData): Observable<Response> {
    let request: Observable<Response>;
    if (this.usePost) {
      if (this.fileData) {
        request = this.http.post(this.url, formData, options);
      }
      else {
        request = this.http.post(this.url, this.jsonObj, options);
      }
    }
    else {
      request = this.http.get(this.url, options)
    }
    return request;
  }

  private getStringifiedValue(value: any): string {
    let result = value;
    if (typeof (value) != 'string') {
      result = JSON.stringify(value);
    }
    return result;
  }

  private autoConvertIsoToDate(object: any): any {
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
      this.logger.log("WebAPIService.autoConvertIsoDateStringToDate/error:" + e);
      throw (e);
    }
    return object;
  }

  private handleError<T>(error): any {
    this.logger.warn(error);
    if (this.unknownError === undefined) {
      try {
        let errorObject = error.json();
        return errorObject;
      }
      catch (ex) {
      }
      return "Unexpected Error";
    }
    var errorEnum: T = this.unknownError;
    try {
      let errorObject = error.json();
      if (errorObject.errorCode) {
        errorEnum = errorObject.errorCode;
      }
    }
    catch (ex) {
    }
    return errorEnum;
  }

  //override this in inherited
  protected unAuthorized(): THandleUnauthorized {
    return "UnAuthorized";
  }
}

export interface IWebApiServiceRequestBuilder {
  params(parameters: any): IWebApiServiceRequestBuilder;
  json(obj: any): IWebApiServiceRequestBuilder;
  file(fileData: any): IWebApiServiceRequestBuilder;
  ErrorIsEnumWithUnkown(unknownError: any);
  execute(): Observable<any>;
  executeGetJson(): Observable<any>;
}

export type THandleUnauthorized = "UnAuthorized" | "RETRY" | "CANCEL";
