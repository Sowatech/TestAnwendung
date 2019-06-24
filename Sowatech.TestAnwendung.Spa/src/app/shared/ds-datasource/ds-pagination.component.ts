import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../utilities/logger.service';
import { DatasourceComponent } from './ds-datasource.component';
import { PaginationInfo } from './ds-dtos.model';

@Component({
    selector: 'ds-pagination',
    template: `<div class="dataTables_paginate">

                        <ul class="pagination" *ngIf="pageItems.length>0 && totalNumOfItems>0">
                            <li class="paginate_button previous noselect" [ngClass]="!hasPrevious?'disabled':''">
                                <span class="noselect" (click)="previousPage()">‹</span>
                            </li>
                            <li *ngFor='let page of pageItems' class="paginate_button noselect" [ngClass]="page.isCurrent?'active disabled':''">
                                <span href="#" class="noselect" (click)="gotoPage(page.pageIndex)">{{page.text}}</span>
                            </li>
                            <li class="paginate_button previous noselect" [ngClass]="!hasNext?'disabled':''">
                                <span href="#" class="noselect" (click)="nextPage()">›</span>
                            </li>
                        </ul>

               </div>
    `,
    styles: [`
        .noselect {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
            cursor:pointer;
        }
        `]
})
export class DatasourcePaginationComponent implements OnInit, OnDestroy {

    constructor(
        private loggerService: LoggerService
    ) {
    }
    private subscriptions = new Array<Subscription>();
    ngOnInit() {
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    pageItems: Array<PageItem> = [];
    pageSize: number=0;
    totalNumOfItems: number = 0;

    @Input('datasource') set setDatasource(datasource: DatasourceComponent) {
        this.datasource = datasource;
        this.subscriptions.push(this.datasource.onPaginationChanged.subscribe((paginationInfo: PaginationInfo) => {
            this.paginationChanged(paginationInfo);
        }));
        this.paginationChanged(this.datasource.paginationInfo);
    }

    private datasource: DatasourceComponent;

    hasPrevious: boolean=false;
    hasNext: boolean = false;

    previousPage() {
        if (this.hasPrevious) this.datasource.gotoPage(this.datasource.currentPageIndex-1);
    }

    nextPage() {
        if (this.hasNext) this.datasource.gotoPage(this.datasource.currentPageIndex+1);
    }

    gotoPage(pageIndex: number) {
        this.datasource.gotoPage(pageIndex);
    }

    private paginationChanged(paginationInfo: PaginationInfo) {
        this.pageItems = [];
        if (paginationInfo) {
            this.totalNumOfItems = paginationInfo.totalNumOfItems;
            this.pageSize = paginationInfo.pageSize;
            let activePageIndex = paginationInfo.currentPageIndex;
			if (activePageIndex > this.datasource.maxPageIndex) activePageIndex = this.datasource.maxPageIndex;
            let minPageItemsIndex = Math.max(0, activePageIndex - 3);
            let maxPageItemsIndex = Math.min(activePageIndex + 3, this.datasource.maxPageIndex);
            for (let pi = minPageItemsIndex; pi <= maxPageItemsIndex; pi++) {
                this.pageItems.push(
                    {
                        text: (pi + 1).toString(),
                        pageIndex: pi,
                        isCurrent: pi == activePageIndex
                    }
                )
            }
            this.hasPrevious = (activePageIndex > 0);
            this.hasNext = (activePageIndex < this.datasource.maxPageIndex);

        }
    }
}

export class PageItem {
    text: string;
    pageIndex: number;
    isCurrent: boolean;
}
