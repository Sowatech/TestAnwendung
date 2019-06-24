import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { LoggerService } from '../utilities';
import { FilterItem, IFilterItem, ISortItem, PaginationInfo, SortItem } from './ds-dtos.model';

const STOREKEY_PREFIX = 'DatasourceRefreshParamsStore.';
const STOREKEY_FILTERITEMS_POSTFIX = '.FilterItems';
const STOREKEY_SORTITEMS_POSTFIX = '.SortItems';
const STOREKEY_PAGEINDEX_POSTFIX = '.PageIndex';
const STOREKEY_SELECTION_POSTFIX = '.Selection';

@Injectable() export class RefreshParamsStoreHelper{

    constructor(
        private loggerService: LoggerService
    ) {
    }
    
    public init(
        storeKey: string,
        onAfterViewInit: Subject<void>,
        onFilterItems: Subject<Array<FilterItem>>,
        onSortItems: Subject<Array<SortItem>>,
        onPaginationChanged: Subject<PaginationInfo>,
        onSelectionChanged: Subject<Array<any>>,
        refreshDatasource: (filterItems: FilterItem[], sortItems: SortItem[], pageIndex?: number,selectedIds?:any[]) => void
    ) {
        this.storeKey = storeKey;
        onAfterViewInit.subscribe(() => {
            this.loadFromStorage();
        });

        onFilterItems.subscribe((filterItems) => { this.onDatasourceFilterChanged(filterItems); });
        onSortItems.subscribe((sortItems) => { this.onDatasourceSortChanged(sortItems); });
        onPaginationChanged.subscribe((paginationInfo: PaginationInfo) => { this.onDatasourcePaginationChanged(paginationInfo); });
        onSelectionChanged.subscribe((selectedIds: any[]) => { this.onDatasourceSelectionChanged(selectedIds); });

        this.refreshDatasource = (filterItems: FilterItem[], sortItems: SortItem[], pageIndex?: number, selectedIds?: any[]) => { refreshDatasource(filterItems, sortItems, pageIndex, selectedIds) };
    }

    private storeKey: string;
    clearStorage() {
        localStorage.setItem(this.filterItemsStoreKey, "");
        localStorage.setItem(this.sortItemsStoreKey, "");
        localStorage.setItem(this.paginationStoreKey, "");
        localStorage.setItem(this.selectionStoreKey, "");
    }

    loadFromStorage() {
        let storedFilterData = <Array<IFilterItem>>JSON.parse(localStorage.getItem(this.filterItemsStoreKey));
        let filterItems = FilterItem.createFilterItems(storedFilterData);

        let storedSortData = <Array<ISortItem>>JSON.parse(localStorage.getItem(this.sortItemsStoreKey));
        let sortItems = SortItem.createSortItems(storedSortData);

        let pageIndex = <number>JSON.parse(localStorage.getItem(this.paginationStoreKey));

        let selectedItems = <Array<any>>JSON.parse(localStorage.getItem(this.selectionStoreKey));
        this.refreshDatasource(filterItems, sortItems, pageIndex, selectedItems);
    }

    private refreshDatasource: (filterItems: FilterItem[], sortItems: SortItem[], pageIndex?: number, selectedIds?: any[]) => void;

    //---FILTER
    private get filterItemsStoreKey(): string {
        return STOREKEY_PREFIX + this.storeKey + STOREKEY_FILTERITEMS_POSTFIX;
    }
    
    private onDatasourceFilterChanged(filterItems: FilterItem[]) {
        localStorage.setItem(this.filterItemsStoreKey, JSON.stringify(filterItems))
    }
    
    //---SORT
    private get sortItemsStoreKey(): string {
        return STOREKEY_PREFIX + this.storeKey + STOREKEY_SORTITEMS_POSTFIX;
    }
    
    private onDatasourceSortChanged(sortItems: SortItem[]) {
        localStorage.setItem(this.sortItemsStoreKey, JSON.stringify(sortItems))
    }

    //---PAGINATION
    private get paginationStoreKey(): string {
        return STOREKEY_PREFIX + this.storeKey + STOREKEY_PAGEINDEX_POSTFIX;
    }

    private onDatasourcePaginationChanged(paginationInfo: PaginationInfo) {
        localStorage.setItem(this.paginationStoreKey, JSON.stringify(paginationInfo.currentPageIndex));
    }

    //---SELECTION
    private get selectionStoreKey(): string {
        return STOREKEY_PREFIX + this.storeKey + STOREKEY_SELECTION_POSTFIX;
    }

    private onDatasourceSelectionChanged(selectedIds: any[]) {
        localStorage.setItem(this.selectionStoreKey, JSON.stringify(selectedIds));
    }

    
}