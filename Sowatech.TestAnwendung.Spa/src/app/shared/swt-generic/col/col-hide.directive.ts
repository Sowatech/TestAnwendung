import 'rxjs/Rx';

import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../../utilities';
import { ColVisibilityService } from './col-visibility.service';


@Directive({
    selector: '[col-hide]'
})
export class ColHideDirective implements OnInit {

    constructor(
        el: ElementRef,
        private logger: LoggerService,
        private colVisibilityService: ColVisibilityService
    ) {
        this.columnElement = el.nativeElement;
    }

    private subscriptions = new Array<Subscription>();
    ngOnInit() {
        this.subscriptions.push(
            this.colVisibilityService.hiddenColumnsChanged.subscribe(
                () => {
                    this.refreshColumnVisibility();
                })
        );
        this.refreshColumnVisibility();
    }

    ngOnDestroy() {
        for (var s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    @Input('col-hide') set dsColHideName(name: string) {
        this.colHideName = name;
    }

    private columnElement: HTMLElement;
    private colHideName: string = "";

    refreshColumnVisibility() {
        let isVisible = this.colVisibilityService.isColumnVisible(this.colHideName);
        this.setColumnHidden(!isVisible);
    }

    private setColumnHidden(value: boolean) {
        if (value) {
            this.columnElement.classList.add("hidden");
        }
        else {
            this.columnElement.classList.remove("hidden");
        }
    }


}
