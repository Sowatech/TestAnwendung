import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { LoggerService } from '../utilities';
import { PaginationInfo } from './ds-dtos.model';

@Injectable() export class PaginationHelper {

    constructor(private logger: LoggerService) {

    }

    public init(dsPaginationChangedEmitter: Subject<PaginationInfo>) {
        this.paginationChangedEmitter = dsPaginationChangedEmitter;
    }

    private paginationChangedEmitter: Subject<PaginationInfo>;
    public get paginationInfo(): PaginationInfo {
        return {
            currentPageIndex: this.currentPageIndex,
            maxPageIndex: this.maxPageIndex,
            totalNumOfItems: this.totalNumOfItems,
            currentPageNumOfItems: this.currentPageIndex < this.maxPageIndex ? this.pageSize : (this.totalNumOfItems - (this.maxPageIndex * this.pageSize)),
            pageSize: this.pageSize
        };
    }

    public pageSize: number = 15;
    public setPageSize(pageSize: number, data: Array<any>) {
        this.pageSize = pageSize;
        this.recalcMaxPageIndexAndTotalNum(data);
    }

    private _currentPageIndex: number = 0;
    get currentPageIndex(): number {
        return this._currentPageIndex;
    }
    set currentPageIndex(value: number) {
        //if (value >= 0 && value <= this.maxPageIndex && value != this._currentPageIndex) {
        //    this._currentPageIndex = value;
        //    this.paginationChangedEmitter.emit(this.paginationInfo);
        //}
        if (value >= 0 && value != this._currentPageIndex) {
            this._currentPageIndex = value;
            this.paginationChangedEmitter.next(this.paginationInfo);
        }
    }

    private totalNumOfItems: number = 0;

    private _maxPageIndex: number = 0;
    get maxPageIndex(): number {
        return this._maxPageIndex;
    }

    private recalcMaxPageIndexAndTotalNum(data: Array<any>) {

        let haschanges = false;
        if (this.totalNumOfItems != data.length) {
            this.totalNumOfItems = data.length;
            haschanges = true;
        }

        let newmaxPageIndex = Math.ceil(data.length / this.pageSize) - 1;
        if (newmaxPageIndex < 0) newmaxPageIndex = 0;
        if (newmaxPageIndex != this._maxPageIndex) {
            this._maxPageIndex = newmaxPageIndex;
            //if (this.currentPageIndex > this._maxPageIndex) {
            //    this.currentPageIndex = this._maxPageIndex;
            //}
            haschanges = true;
        }
        if (haschanges) {
            this.paginationChangedEmitter.next(this.paginationInfo);
        }
    }

    public execute(data: Array<any>) {

        this.recalcMaxPageIndexAndTotalNum(data);
        if (this.pageSize <= 1 || data.length <= this.pageSize) {
            return;
        }
        else {
            if (this.currentPageIndex < 0) this.currentPageIndex = 0;
            //if (this.currentPageIndex > this.maxPageIndex) this.currentPageIndex = this.maxPageIndex;
            let usedPageIndex = this.currentPageIndex <= this.maxPageIndex ? this.currentPageIndex : this.maxPageIndex;
            //let workSource = Enumerable.from(data).skip(this.currentPageIndex * this.pageSize).take(this.pageSize).toArray();
            let workSource = data.slice(usedPageIndex * this.pageSize, usedPageIndex * this.pageSize + this.pageSize);
            data.splice(0);//duplicate ???
            for (var workItem of workSource) {
                data.push(workItem);
            }
        }
    }
}
