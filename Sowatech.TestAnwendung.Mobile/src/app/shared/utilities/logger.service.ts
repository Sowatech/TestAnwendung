import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {

    assert(test?: boolean, message?: string, ...optionalParams: any[]): void {
        console.assert(test, message, optionalParams);
    }

    clear(): void {
        console.clear();
    }

    count(countTitle?: string): void {
        console.count(countTitle);
    }

    debug(message?: string, ...optionalParams: any[]): void {
        console.debug(message, optionalParams);
    }

    dir(value?: any, ...optionalParams: any[]): void {
        console.dir(value, optionalParams);
    }

    dirxml(value: any): void {
        console.dirxml(value);
    }

    error(message?: any, ...optionalParams: any[]): void {
        console.error(message, optionalParams);
    }

    group(groupTitle?: string): void {
        console.group(groupTitle);
    }

    groupCollapsed(groupTitle?: string): void {
        console.groupCollapsed(groupTitle);
    }

    groupEnd(): void {
        console.groupEnd();
    }

    info(message?: any, ...optionalParams: any[]): void {
        //console.info(message,optionalParams);
        console.info("!info: " + message, optionalParams);//zum unterscheiden von .log() in protractor tests (dort sind beides INFO Logs)
    }

    log(message?: any, ...optionalParams: any[]): void {
        console.log(message, optionalParams);
    }

    msIsIndependentlyComposed(element: Element): boolean {
        return console.msIsIndependentlyComposed(element);
    }

    profile(reportName?: string): void {
        console.profile(reportName);
    }

    profileEnd(): void {
        console.profileEnd();
    }

    select(element: Element): void {
        console.select(element);
    }

    time(timerName?: string): void {
        console.time(timerName);
    }

    timeEnd(timerName?: string): void {
        console.timeEnd(timerName);
    }

    trace(message?: any, ...optionalParams: any[]): void {
        console.trace(message, optionalParams);
    }

    warn(message?: any, ...optionalParams: any[]): void {
        console.warn(message, optionalParams);
    }
}
