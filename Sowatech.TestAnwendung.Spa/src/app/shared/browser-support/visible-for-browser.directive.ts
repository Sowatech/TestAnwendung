import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService, Session } from '../utilities';
import { BrowserSupportService } from './browser-support.service';


@Directive({ selector: '[visible-for-browser]' })

export class VisibleForBrowserDirective implements OnInit, OnDestroy {

    @Input('visible-for-browser') set _visibleForBrowser(value: BrowserInput[]) {
        this.browsers = value;
    }

    private browsers: BrowserInput[];

    private nativeElement: HTMLElement;

    constructor(
        el: ElementRef,
        private session: Session,
        private logger: LoggerService,
        public browserInfoService: BrowserSupportService,
    ) {
        this.nativeElement = el.nativeElement;
    }

    private subscriptions = new Array<Subscription>();

    ngOnInit() {
        if (this.isBrowserSupported) {
            this.setClassNone();
        }
        else {
            this.setClassHidden();
        }
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    private get isBrowserSupported(): boolean {
        return this.browsers.some(b => b.name == this.browserInfoService.name && (b.version ? b.version <= this.browserInfoService.version : true) && (b.system ? b.system.some(s => s == this.browserInfoService.system) : true));
    }

    private setClassNone() {
        this.removeClass('hidden');
    }

    private setClassHidden() {
        this.addClass('hidden');
    }

    private removeClass(className: string) {
        this.nativeElement.classList.remove(className);
    }

    private addClass(className: string) {
        if (!this.nativeElement.classList.contains(className)) this.nativeElement.classList.add(className);
    }
}

export class BrowserInput {
    name: TBrowserName;
    version?: number | string;
    system?: TBrowserSystem[];
}

export type TBrowserName = 'Microsoft Edge' | 'Internet Explorer' | 'Firefox' | 'Chrome' | 'Safari' | 'Opera' | 'Cordova';

export type TBrowserSystem = 'mac' | 'windows' | 'windowsphone' | 'linux' | 'chromeos' | 'android' | 'ios' | 'blackberry' | 'firefoxos' | 'webos' | 'bada' | 'tizen' | 'sailfish';
