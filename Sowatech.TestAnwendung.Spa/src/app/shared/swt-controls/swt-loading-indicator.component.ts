import { AfterContentInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

import { LoggerService } from '../utilities';

@Component({
    selector: 'loading-indicator',
    template: `<div #loadingContainer>
                   <ng-content></ng-content>
                   <div *ngIf="visible" class="loading-indicator-backdrop fade"></div>
                   <div *ngIf="visible" class="loading-indicator" [style.top]="topdistance">
                        <div class="sk-spinner sk-spinner-circle" [style.width]="spinnerSize" [style.height]="spinnerSize">
                                        <div class="sk-circle1 sk-circle"></div>
                                        <div class="sk-circle2 sk-circle"></div>
                                        <div class="sk-circle3 sk-circle"></div>
                                        <div class="sk-circle4 sk-circle"></div>
                                        <div class="sk-circle5 sk-circle"></div>
                                        <div class="sk-circle6 sk-circle"></div>
                                        <div class="sk-circle7 sk-circle"></div>
                                        <div class="sk-circle8 sk-circle"></div>
                                        <div class="sk-circle9 sk-circle"></div>
                                        <div class="sk-circle10 sk-circle"></div>
                                        <div class="sk-circle11 sk-circle"></div>
                                        <div class="sk-circle12 sk-circle"></div>
                                    </div>
                        <div [hidden]="!text" class="loading-indicator-text">{{text}}</div>
                    </div>
                </div>
`,
    styles: [`
        .loading-indicator-container-off {}
        .loading-indicator-container-on { position: relative;overflow:hidden }
        .loading-indicator { position: absolute; width:100%; height:100%; top:0 }
        .loading-indicator-backdrop { position: absolute; width:100%; height:100%;background-color:silver;opacity:0.25;top:0; }    
        .loading-indicator-text {text-align:center}
  `],
})
    
export class LoadingIndicatorComponent implements AfterContentInit {
    
    @Input() text: string;
    @Input() spinnerSize: string;
    @ViewChild('loadingContainer') set loadingContainerRef(ref: ElementRef) { this.loadingContainer = ref.nativeElement };
    private loadingContainer: HTMLElement;

    visible: boolean;
    topdistance: string;
    
    constructor(private logger: LoggerService) {
        this.visible = false;
        this.topdistance = "0";
        this.spinnerSize = "30px";
        this.text = "";
    }

    ngAfterContentInit() {
        this.loadingContainer.classList.add("loading-indicator-container-off");
        this.recalcPosition();
    }

    private recalcPosition() {
        this.topdistance = Math.floor(this.loadingContainer.clientHeight / 2 - 15) + "px";
    }

    show() {
        setTimeout(() => {
            this.recalcPosition();
            this.loadingContainer.classList.remove("loading-indicator-container-off");
            this.loadingContainer.classList.add("loading-indicator-container-on");
            this.visible = true;
        }, 0);
    }

    hide() {
        setTimeout(() => {
            this.visible = false;
            this.loadingContainer.classList.add("loading-indicator-container-off");
            this.loadingContainer.classList.remove("loading-indicator-container-on");
        }, 0);
    }

}