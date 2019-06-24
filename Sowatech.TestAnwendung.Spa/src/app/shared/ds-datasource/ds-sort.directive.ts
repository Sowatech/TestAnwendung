import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../utilities';
import { DatasourceComponent } from './ds-datasource.component';
import { SortItem } from './ds-dtos.model';

@Directive({
    selector: '[ds-sort]'
})

export class DatasourceSortDirective implements OnInit, OnDestroy {

    @Input('ds-sort') sortField: string;
    @Input() datasource: DatasourceComponent;
    @Input('icon-left') setIconLeft: boolean = false;
    @Input('ds-sort-icon-align') sortIconAlign: 'left' | 'right';

    private nativeElement: HTMLElement;

    constructor(el: ElementRef, private logger: LoggerService
    ) {
        this.nativeElement = el.nativeElement;
    }

    private subscriptions = new Array<Subscription>();

    ngOnInit() {
        if (this.sortField) {
            this.setClassNone();
            this.subscriptions.push(this.datasource.onSortItems.subscribe((sortItems: SortItem[]) => {
                this.onTableSortingChanged(sortItems);
            }));
            this.onTableSortingChanged(this.datasource.getSortItems());
        }
        if (this.sortIconAlign == 'left') {
          this.setClassIconLeft();
        }
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    private onTableSortingChanged(sortItems: SortItem[]) {
        let mySortItem = sortItems.find(item => item.fieldname == this.sortField);
        if (!mySortItem) {
            this.setClassNone();
        }
        else {
            if (mySortItem.reverse) {
                this.setClassDesc();
            }
            else {
                this.setClassAsc();
            }
        }
    }

    private setClassNone() {
        this.removeClass('sorting_asc');
        this.removeClass('sorting_desc');
        this.addClass('sorting');
    }

    private setClassAsc() {
        this.addClass('sorting_asc');
        this.removeClass('sorting_desc');
        this.removeClass('sorting');
    }

    private setClassDesc() {
        this.addClass('sorting_desc');
        this.removeClass('sorting_asc');
        this.removeClass('sorting');
    }

    private setClassIconLeft() {
      this.addClass('iconleft');
    }

    private removeClass(className: string) {
        this.nativeElement.classList.remove(className);
    }

    private addClass(className: string) {
        if (!this.nativeElement.classList.contains(className)) this.nativeElement.classList.add(className);
    }

    @HostListener('click') onClick() {
        if (!this.sortField) return;
        if (this.nativeElement.classList.contains('sorting_asc')) {
            this.setClassDesc();
            this.datasource.sortDesc(this.sortField);
        }
        else {
            this.setClassAsc();
            this.datasource.sortAsc(this.sortField);
        }

    }

}
