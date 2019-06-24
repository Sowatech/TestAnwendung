import { Inject, Injectable } from '@angular/core';
import * as bowser from 'bowser';

@Injectable()
export class BrowserSupportService {

    name: string = bowser.name;
    version: string | number = bowser.version;
    system: string = this.getSystem();

    getSystem(): string {
        if (bowser.mac)
            return "mac";
        if (bowser.windows)
            return "windows";
        if (bowser.windowsphone)
            return "windowsphone";
        if (bowser.linux)
            return "linux";
        if (bowser.chromeos)
            return "chromeos";
        if (bowser.android)
            return "android";
        if (bowser.ios)
            return "ios";
        if (bowser.blackberry)
            return "blackberry";
        if (bowser.firefoxos)
            return "firefoxos";
        if (bowser.webos)
            return "webos";
        if (bowser.bada)
            return "bada";
        if (bowser.tizen)
            return "tizen";
        if (bowser.sailfish)
            return "sailfish";
        return "(undefined)"
    }
}