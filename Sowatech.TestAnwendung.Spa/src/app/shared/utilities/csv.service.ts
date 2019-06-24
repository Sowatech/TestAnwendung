import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import * as Papa from 'papaparse';
import { Observable } from 'rxjs';
import { Observer } from 'rxjs/Observer';
import * as moment from 'moment';
import { saveAs } from 'file-saver';

@Injectable()
export class CsvService {
    constructor(
        @Inject(LOCALE_ID) private _locale: string,
    ) {
    }
    
    unparse(data: Array<Object>, config?: UnparseConfig): csvString;
    unparse(data: Array<Array<any>>, config?: UnparseConfig): csvString;
    unparse(data: UnparseObject, config?: UnparseConfig): csvString;
    public unparse(arg: any, config?: UnparseConfig): csvString {
        if (!config)
            config = {
                quotes: true,
                delimiter: ";",
                newline: "\r"
            };

        let result: csvString = "";
        if (arg instanceof Array && arg.every(elem => elem instanceof Object)) {
            let unparsedObjects = this.cleanseObjectsForUnparse(arg);
            result = Papa.unparse(unparsedObjects, config);
        } else result = Papa.unparse(arg, config);
        return result;
    }

    private cleanseObjectsForUnparse(inputObject: Object[]): Object[] {
        let resultObjects: Object[] = [];
        for (let item of inputObject) {
            let obj: Object = new Object();
            for (let prop in item) {
                if (typeof item[prop] !== "function" && !(item[prop] instanceof Array)) {
                    obj[prop] = item[prop];
                }
                if (typeof item[prop] === "number") {
                    if (this._locale != "en-US")
                        obj[prop] = item[prop].toString().replace(".", ",");
                }
            }
            resultObjects.push(obj);
        }
        return resultObjects;
    }

    public downloadCsv(data: csvString, fileName: string) {
        let blob: Blob = new Blob(["\ufeff", data]);
        saveAs(blob, fileName + ".csv");
    }

    parseCsv(csvString: string, config?: CsvConfig): Observable<CsvResult>;
    parseCsv(file: File, config?: CsvConfig): Observable<CsvResult>;
    public parseCsv(arg1: any, config?: CsvConfig): Observable<CsvResult> {
        var observable = Observable.create(anyObserver => {
            let observer = <Observer<CsvResult>>anyObserver;
            let file: File = typeof arg1 == "string" ? null : arg1;
            if (file && file.name.indexOf(".csv") < 0) {
                observer.error({error: {message: "file is no csv-file"}, file: file});
            } else {
                let parseConfig: ParseConfig = config ? {...config} : {};
                if (!parseConfig.encoding) parseConfig.encoding = "iso-8859-1";
                parseConfig.error = (error: ParseError, file?: File) => {
                    observer.error({error: error, file: file});
                    observer.complete();
                };
                parseConfig.complete = (results: ParseResult, file?: File) => {
                    observer.next(results);
                    observer.complete();
                };
                Papa.parse(arg1, parseConfig);
            }
        });
        return observable;
    }

    getCsvAsObjects<T>(conf: CsvCreateObjectConfig, csvResult: CsvResult): Array<T> {
        console.log("getCsvAsObjects");
        let result: Array<T> = [];
        if (csvResult && csvResult.data && csvResult.data.length > 1) {
            let config = new CsvCreateObjectConfig();
            config.copy(conf);
            let header: Array<any> = csvResult.data[0];
            for (let rowIndex = 1; rowIndex < csvResult.data.length; rowIndex++) {
                let row = csvResult.data[rowIndex];
                let obj = <T>{};
                for (let field of config.configFields) {
                    let index = header.findIndex(h => h.toLowerCase() == field.fieldname.toLowerCase());
                    switch (field.type) {
                        case "string":
                            obj[field.fieldname] = <string>row[index];
                            break;
                        case "boolean":
                            obj[field.fieldname] = <boolean>row[index];
                            break;
                        case "number":
                            if (row[index]) obj[field.fieldname] = row[index].replace(",", ".");
                            break;
                        case "Date":
                            obj[field.fieldname] = moment(row[index], field.dateFormat).format("YYYY-MM-DD");
                            break;
                        case "DateTime":
                            obj[field.fieldname] = moment(row[index], field.dateFormat).toDate();
                            break;
                        case "string[]":
                            if (row.length >= index) obj[field.fieldname] = (<string>row[index]).split(field.stringArraySeparator);
                            break;
                    }
                }
                result.push(obj);
            }
        }
        return result;
    }
}


export class CsvCreateObjectConfig {
    configFields: CsvCreateObjectField[];
    copy?(config: CsvCreateObjectConfig) {
        this.configFields = new Array<CsvCreateObjectField>();
        for (let field of config.configFields) {
            let configField = new CsvCreateObjectField();
            for (let prop in field) {
                configField[prop] = field[prop];
            }
            this.configFields.push(configField);
        }
    }
}

export class CsvCreateObjectField {
    fieldname: string;
    type: "string" | "boolean" | "number" | "Date" | "DateTime" | "string[]";
    stringArraySeparator?: string;
    dateFormat?: string = "DD-MM-YYYY";
}

interface ParseConfig {
    delimiter?: string; // default: ""
    newline?: string; // default: ""
    header?: boolean; // default: false
    dynamicTyping?: boolean; // default: false
    preview?: number; // default: 0
    encoding?: string; // default: ""
    worker?: boolean; // default: false
    comments?: boolean; // default: false
    download?: boolean; // default: false
    skipEmptyLines?: boolean; // default: false
    fastMode?: boolean; // default: undefined

    // Callbacks
    step?(results: ParseResult, parser: Parser): void; // default: undefined
    complete?(results: ParseResult, file?: File): void; // default: undefined
    error?(error: ParseError, file?: File): void; // default: undefined
    chunk?(results: ParseResult, parser: Parser): void; // default: undefined
    beforeFirstChunk?(chunk: string): string | void; // default: undefined
}

interface UnparseConfig {
    quotes: boolean; // default: false
    delimiter: string; // default: ","
    newline: string; // default: "\r\n"
}

interface UnparseObject {
    fields: Array<any>;
    data: string | Array<any>;
}

export interface ParseResult {
    data: Array<any>;
    errors: Array<ParseError>;
    meta: ParseMeta;
}

interface ParseMeta {
    delimiter: string; // Delimiter used
    linebreak: string; // Line break sequence used
    aborted: boolean; // Whether process was aborted
    fields: Array<string>; // Array of field names
    truncated: boolean; // Whether preview consumed all input
}

interface ParseError {
    type: string; // A generalization of the error
    code: string; // Standardized error code
    message: string; // Human-readable details
    row: number; // Row index of parsed data where error is
}

interface ParserConstructor {
    new (config: ParseConfig): Parser;
}
interface Parser {
    // Parses the input
    parse(input: string, baseIndex: number, ignoreLastRow: boolean): any;

    // Sets the abort flag
    abort(): void;

    // Gets the cursor position
    getCharIndex(): number;
}

//-------------------------------------
export interface CsvConfig {
    //paparse
    delimiter?: string; // default: ""
    newline?: string; // default: ""
    header?: boolean; // default: false
    dynamicTyping?: boolean; // default: false
    preview?: number; // default: 0
    encoding?: string; // default: ""
    worker?: boolean; // default: false
    comments?: boolean; // default: false
    download?: boolean; // default: false
    skipEmptyLines?: boolean; // default: false
    fastMode?: boolean; // default: undefined
}

export interface CsvResult {
    data: Array<any>;
    errors: Array<ParseError>;
    meta: ParseMeta;
}

export type csvString = string;
