import { browser } from "protractor";

export class LogsPageHelper {

    constructor() {
        this.logs = global["logs"];// see protractor.conf.js
    }

    public logs: ILogs;
}

export interface ILogs {
    reset(): void;
    expect(param1: TLogParam, param2?: TLogParam):void;
    ignore(param1: TLogParam, param2?: TLogParam): void;
    DEBUG: TLogTypeParamConst;//byLevel('DEBUG')
    ERROR: TLogTypeParamConst;//byLevel('SEVERE')
    WARNING: TLogTypeParamConst;//byLevel('WARNING')
    INFO: TLogTypeParamConst;//achtung : info und log hier identisch byLevel('INFO')
    LOG: TLogTypeParamConst;//achtung : info und log hier identisch byLevel('INFO')
    or: any;
    and: any;
    verify: () => void;
}

export type TLogFunction = (log: {message:string}) => boolean;
export type TLogParam = RegExp | string | TLogFunction;
export type TLogTypeParamConst = () => (message: any) => boolean;

