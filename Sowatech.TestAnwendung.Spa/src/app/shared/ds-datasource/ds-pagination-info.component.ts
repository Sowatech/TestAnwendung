import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../utilities/logger.service';
import { DatasourceComponent } from './ds-datasource.component';
import { PaginationInfo } from './ds-dtos.model';

@Component({
    selector: 'ds-pagination-info',
    template: `
        <div *ngIf="itemNumberTotal>0" class="dataTables_info" role="status" aria-live="polite">
            Anzeige {{itemNumberFrom}} bis {{itemNumberTo}} von {{itemNumberTotal}} Datensätzen
        </div>
        <div *ngIf="itemNumberTotal==0" class="dataTables_info" role="status" aria-live="polite">

        </div>
    `
})

export class DatasourcePaginationInfoComponent implements OnInit, OnDestroy {

    constructor(private loggerService: LoggerService) {
    }

    @Input('datasource') set setDatasource(value: DatasourceComponent) {
        this.datasource = value;
        this.subscriptions.push(
            this.datasource.onPaginationChanged.subscribe((paginationInfo: PaginationInfo) => {
                this.paginationChanged(paginationInfo);
            }));
        this.paginationChanged(this.datasource.paginationInfo);
    }

    private subscriptions = new Array<Subscription>();

    ngOnInit() {
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    private datasource: DatasourceComponent;
    itemNumberFrom: number = 0;
    itemNumberTo: number = 0;
    itemNumberTotal: number = 0;

    private paginationChanged(paginationInfo: PaginationInfo) {
        if (!paginationInfo) {
            this.loggerService.warn("paginationInfo is null");
            return;
        }
        this.itemNumberTotal = paginationInfo.totalNumOfItems;
        let usedPageIndex = paginationInfo.currentPageIndex <= paginationInfo.maxPageIndex ? paginationInfo.currentPageIndex : paginationInfo.maxPageIndex;
        this.itemNumberFrom = (usedPageIndex * paginationInfo.pageSize) + 1;
        this.itemNumberTo = paginationInfo.pageSize > 0 ? this.itemNumberFrom + paginationInfo.currentPageNumOfItems - 1 : this.itemNumberTotal;
    }
}

