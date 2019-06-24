import { Component, Input } from '@angular/core';

import { LoggerService } from '../utilities/logger.service';
import { BrowserSupportService } from './browser-support.service';

@Component({
    selector: 'browser-support-info',
    moduleId: module.id,
    templateUrl: './browser-support-info.component.html',
    styles: [` 
        div > div {
        color: #9C98A6;
        font-size: 1.2rem;
        }
        .browser_support-logos {
            margin: 3rem auto 0;
            max-width: 65rem;
        }
        .browser-image {
            position: relative;
            display: inline-block;
            margin: .5rem .5rem 2rem;
            width: 8.5rem;
        }
        .browser_support-logos .link-image, .browser_support-logos .link-image-short {
            vertical-align: middle;
        }
        .img-microsoft_edge {
            background-image: url(/assets/img/svg/browserLogos-edge.svg);
        }  
        .img-internet_explorer {
            background-image: url(/assets/img/svg/browserLogos-ie.svg);
        } 
        .img-firefox {
            background-image: url(/assets/img/svg/browserLogos-firefox.svg);
        } 
        .img-chrome {
            background-image: url(/assets/img/svg/browserLogos-chrome.svg);
        } 
        .img-safari {
            background-image: url(/assets/img/svg/browserLogos-safari.svg);
        } 
        .img-opera {
            background-image: url(/assets/img/svg/browserLogos-opera.svg);
        } 
        .img-cordova {
            background-image: url(/assets/img/png/browserLogos-cordova.png);
        }   
        .link-image {
            width: 4.95rem;
            height: 4.95rem;
            display: block;
            margin: 0 auto;
            max-width: 23.1rem;
            
            background-repeat: no-repeat;
            background-position: center center;
            background-size: contain;
            transform: translateZ(0) scale(1);
            transition: transform 80ms; 
        }
        @media (min-width: 600px)
        .browser_support-logos .link-image {
            margin: 0 4rem .5rem;
        }
        @media (min-width: 480px)
        .browser_support-logos .link-image {
            margin: 0 3rem .5rem;
        }
        @media (min-width: 700px)
        .link-image {
            width: 6.05 rem;
            height: 6.05 rem;
        }
    `]
})
export class BrowserSupportInfoComponent  {
    constructor(
        public browserInfoService: BrowserSupportService,
        public loggerService: LoggerService
    ) { }

    @Input() set validBrowsers(values: Array<BrowserInput>) {
        this.browsers = values
            .filter(bi => this.isValid(bi))
            .map(bi => { return new BrowserModel(bi) });
    }
    public browsers: Array<BrowserModel> = [];

    isValid(bi): boolean {
        if (bi.name == 'Microsoft Edge' || bi.name == 'Internet Explorer' || bi.name == 'Firefox' || bi.name == 'Chrome' || bi.name == 'Safari' || bi.name == 'Opera' || bi.name == 'Cordova')
            return true;
        this.loggerService.warn("BrowserSupportInfoComponent: " + bi.name + ' is not a known browser');
        return false;
    }
}

export class BrowserInput {
    name: TBrowserName;
    version?: number | string;
    system?: TBrowserSystem[];
}

class BrowserModel {
    constructor(input: BrowserInput) {
        return {
            ...input,
            class: BrowserModel.getClass(input.name)
        }
    }
    name: TBrowserName;
    version?: number | string;
    system?: TBrowserSystem[];
    class?: string;

    static getClass(name: string): string {
        switch (name) {
            case "Microsoft Edge":
                return "img-microsoft_edge";
            case "Internet Explorer":
                return "img-internet_explorer";
            case "Firefox":
                return "img-firefox";
            case "Chrome":
                return "img-chrome";
            case "Safari":
                return "img-safari";
            case "Opera":
                return "img-opera";
            case "Cordova":
                return "img-cordova png";
        }
    }
}

export type TBrowserName = 'Microsoft Edge' | 'Internet Explorer' | 'Firefox' | 'Chrome' | 'Safari' | 'Opera' | 'Cordova';  

export type TBrowserSystem = 'mac' | 'windows' | 'windowsphone' | 'linux' | 'chromeos' | 'android' | 'ios' | 'blackberry' | 'firefoxos' | 'webos' | 'bada' | 'tizen' | 'sailfish';  
