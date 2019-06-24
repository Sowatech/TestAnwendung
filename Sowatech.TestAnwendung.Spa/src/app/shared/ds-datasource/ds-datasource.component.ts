import { AfterViewInit, Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '../utilities';
import {
    FilterItem,
    FilterOperator,
    GroupConfiguration,
    PaginationInfo,
    RefreshParams,
    RefreshResult,
    SortItem
} from './ds-dtos.model';
import { FilterHelper } from './ds-filter-helper.service';
import { GroupHelper } from './ds-group-helper.service';
import { PaginationHelper } from './ds-pagination-helper.service';
import { RefreshParamsStoreHelper } from './ds-refreshparams-store.service';
import { SelectionListHelper } from './ds-selection-list-helper.service';
import { SortHelper } from './ds-sort-helper.service';

@Component({
    selector: "ds-datasource",
    template: "",
    providers: [
        SelectionListHelper,
        SortHelper,
        FilterHelper,
        PaginationHelper,
        GroupHelper,
        RefreshParamsStoreHelper
    ]
})
export class DatasourceComponent implements OnInit, AfterViewInit, OnDestroy {
    constructor(
        private loggerService: LoggerService,
        private selectionList: SelectionListHelper,
        private sortHelper: SortHelper,
        private filterHelper: FilterHelper,
        private paginationHelper: PaginationHelper,
        private groupHelper: GroupHelper,
        private refreshParamsStoreHelper: RefreshParamsStoreHelper
    ) {
        this.refreshBlocked = true;
    }

    private subscriptions = new Array<Subscription>();

    ngOnInit() {
        this.initPaginationHelper();
        this.initSelectionList();
        //this.initFilterHelper();//todo: eventemitter in ds component verlagern wie beoi paginationHelper
        //this.initSortHelper();//todo
        //this.initGroupHelper();//todo
        this.initRefreshParamsStoreHelper();
    }

    private onAfterViewInit: Subject<void> = new Subject<void>();
    ngAfterViewInit() {
        this.onAfterViewInit.next();
        this.refreshBlocked = false;
    }

    ngOnDestroy() {
        for (var s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    @Input("src")
    set sourceData(data: Array<any>) {
        this.initDataSource(data);
    }
    @Input("pageSize")
    set doSetPageSize(value: number) {
        this.setPageSize(value);
    }
    @Input("store-key") storeKey: string; //key fuer localStorage (optional fuer speichern aktuelle refreshdaten)
    @Input("idfield") idfield: string; //wird benoetigt wenn ein datensatz anhand seiner id gefunden werden soll. zb selected ids bei paging
    @Input("groupBy")
    set groupBy(fieldnames: string[]) {
        this.setGroup(fieldnames);
    }
    @Input("sortBy")
    set sortBy(fieldname: string) {
        this.setSort(fieldname);
    }
    @Output("onAfterRefresh") onAfterRefresh = new Subject<void>();
    @Output("onBeforeRefresh") onBeforeRefresh = new Subject<void>();
    @Output("onAfterInitDatasoure") onAfterInitDatasoure = new Subject<void>();

    set externalRefresh(
        method: (params: RefreshParams) => Observable<RefreshResult<any>>
    ) {
        this._externalRefresh = method;
        if (method) {
            this.externalRefreshParams = new RefreshParams();
            this.refresh();
        } else {
            this.externalRefreshParams = null;
        }
    }
    get externalRefresh(): (
        params: RefreshParams
    ) => Observable<RefreshResult<any>> {
        return this._externalRefresh;
    }
    private _externalRefresh: (
        params: RefreshParams
    ) => Observable<RefreshResult<any>>;

    public dataBackup: Array<any> = []; //copy of the original provided data. used to refresh

    public get dataFiltered(): Array<any> {
        //the filtered data (ignoring pagination)
        let filteredData: any[] = [];
        this.doInternalRefresh(filteredData, false);
        return filteredData;
    }

    public get hasData(): boolean {
        return this.dataBackup.length > 0;
    }

    public data: Array<any> = []; //the current filtered/sorted data. readonly! use initDataSource(data) to set new data

    public getDataItem(id: any): any {
        return this.dataBackup.find(item => {
            return item[this.idfield] == id;
        });
    }

    public getDataDistinct(fieldname: string): Array<any> {
        return Array.from(new Set(this.dataBackup.map(d => d[fieldname]))); //.sort(); evtl. noch sorten
    }

    public async initDataSource(data: Array<any>) {
        if (data) {
            this.dataBackup = data.slice(0);
            this.data = data;
            if (data.length > 0) this.autoDetectIdField(data[0]);
            await this.refresh();
			this.autoSelectFirstItem();
            this.onAfterInitDatasoure.next(null);
        }
    }

	@Input() autoSelect: boolean = false;

    public autoSelectFirstItem() {
        if (!this.autoSelect) return;
        if (!this.focusedItem && this.data.length > 0) {
            let firstModel = this.data[0];
            this.focus(firstModel[this.idfield], true);
        }
    }

    private autoDetectIdField(dataItem: any) {
        if (!this.idfield) {
            if (dataItem["id"] != undefined) this.idfield = "id";
            if (!this.idfield)
                if (dataItem["Id"] != undefined) this.idfield = "Id";
            if (!this.idfield)
                if (dataItem["ID"] != undefined) this.idfield = "ID";
            if (!this.idfield)
                this.loggerService.warn("datasource.idfield is not specified");
        }
    }

    private _refreshBlocked = false;
    private blockedRefreshRequested = false;
    public set refreshBlocked(value: boolean) {
        if (value) {
            this._refreshBlocked = true;
        } else {
            this._refreshBlocked = false;
            if (this.blockedRefreshRequested) {
                this.refresh(); //refresh nachholen
                this.blockedRefreshRequested = false;
            }
        }
    }
    public get refreshBlocked(): boolean {
        return this._refreshBlocked;
    }

    public async refresh() {
        if (!this.refreshBlocked) {
            this.onBeforeRefresh.next();
            if (this.externalRefresh) {
                await this.doExternalRefresh();
            } else {
                this.doInternalRefresh(this.data);
            }
			if (this.focusAfterRefreshId != null) {
                let focusId = this.focusAfterRefreshId;
                this.focusAfterRefreshId = null;
                this.focus(focusId, true);
            }
            this.onAfterRefresh.next();
        } else {
            this.blockedRefreshRequested = true;
        }
    }

    private doInternalRefresh(destData: any[], doPagination: boolean = true) {
        if (!this.isGrouped) {
            this.filterHelper.execute(this.dataBackup, destData);
            this.sortHelper.execute(destData);
            if (doPagination) this.paginationHelper.execute(destData);
        } else {
            this.filterHelper.execute(this.dataBackup, destData);
            this.groupHelper.execute(destData);
            this.sortHelper.execute(destData);
            for (let groupData of destData) {
                this.sortHelper.execute(destData);
            }
            if (doPagination) this.paginationHelper.execute(destData);
        }
    }

    private externalRefreshParams: RefreshParams = new RefreshParams();
    public getExternalRefreshParams(): RefreshParams {
        return this.externalRefreshParams;
    }

    private doExternalRefresh() {
        this.externalRefreshParams.paginationInfo.pageSize = this.paginationHelper.pageSize; //andere pageInfos koennen nicht durch paginationHelper ermittelt werden
        this.externalRefreshParams.sortItems = this.sortHelper.sortItems;
        this.externalRefreshParams.filterItems = this.filterHelper.filterItems;

        this.externalRefresh(this.externalRefreshParams).subscribe(
            result => {
                this.dataBackup = result.data;
                this.data.splice(0);
                this.externalRefreshParams = result.refreshParams;
                this.onPaginationChanged.next(
                    result.refreshParams.paginationInfo
                );
                if (result.data) {
                    for (var dataItem of result.data) {
						let viewModelItem = dataItem;
						if (this.externalDataItem2ViewModel) {
							viewModelItem = this.externalDataItem2ViewModel(dataItem);
						}
						this.data.push(viewModelItem);
					}
                }
            },
            error => {
                this.loggerService.error(error);
            }
        );
    }
	
	public externalDataItem2ViewModel: (externalDataItem: any) => any;

    public getPageIndexById(id: any): number {
        if (this.externalRefresh) {
            this.loggerService.warn(
                "getPageIndexById not implemented for externalRefresh"
            );
            return -1;
        } else {
            let searchData: any[] = [];
            this.doInternalRefresh(searchData, false); //normales refresh ausfuehren in eine such-liste, OHNE die pagination auszufuehren
            let itemIdx = -1;
            for (var d of searchData) {
                itemIdx++;
                if (d[this.idfield] == id) {
                    break;
                }
            }

            let pageIndex = -1;
            if (this.paginationHelper.pageSize > 0) {
                pageIndex =
                    Math.ceil((itemIdx + 1) / this.paginationHelper.pageSize) -
                    1;
            }
            return pageIndex;
        }
    }

    setSort(field: string) {
        this.sortHelper.set(new SortItem(field));
        this.refresh();
    }

    get onSortItems(): Subject<Array<SortItem>> {
        return this.sortHelper.onSortItems;
    }

    getSortItems(): Array<SortItem> {
        return this.sortHelper.sortItems;
    }

    sortAsc(fieldname: string) {
        this.sortHelper.set(new SortItem(fieldname));
        this.refresh();
    }

    sortDesc(fieldname: string) {
        this.sortHelper.set(new SortItem(fieldname, true));
        this.refresh();
    }

    sort(sortItem: SortItem) {
        this.sortHelper.set(sortItem);
        this.refresh();
    }

    clearSort() {
        this.sortHelper.clear();
        this.refresh();
    }

    //----------------

    get onFilterItems(): Subject<Array<FilterItem>> {
        return this.filterHelper.onFilterItems;
    }

    setFilter(filterItems: Array<FilterItem>);
    setFilter(
        fieldname: string,
        fieldvalues: Array<string>,
        filteroperator?: FilterOperator
    );
    setFilter(
        fieldnames: Array<string>,
        fieldvalue: string,
        filteroperator?: FilterOperator
    );
    setFilter(
        fieldnames: Array<string>,
        fieldvalues: Array<string>,
        filteroperator?: FilterOperator
    );
    setFilter(
        fieldname: string,
        fieldvalue: string,
        filteroperator?: FilterOperator
    );
    setFilter(arg1: any, arg2?: any, filteroperator?: FilterOperator) {
        if (arg2 == undefined) {
            let filterItems = <Array<FilterItem>>arg1;
            this.filterHelper.set(filterItems);
        } else {
            let fieldnames: string[] = Array.isArray(arg1) ? arg1 : [arg1];
            let fieldvalues: string[] = Array.isArray(arg2) ? arg2 : [arg2];
            this.filterHelper.set(
                new FilterItem(fieldnames, fieldvalues, filteroperator)
            );
        }
        this.refresh();
    }

    addFilter(filterItems: Array<FilterItem>);
    addFilter(
        fieldname: string,
        fieldvalues: Array<string>,
        filteroperator?: FilterOperator
    );
    addFilter(
        fieldnames: Array<string>,
        fieldvalue: string,
        filteroperator?: FilterOperator
    );
    addFilter(
        fieldnames: Array<string>,
        fieldvalues: Array<string>,
        filteroperator?: FilterOperator
    );
    addFilter(
        fieldname: string,
        fieldvalue: string,
        filteroperator?: FilterOperator
    );
    addFilter(arg1: any, arg2?: any, filteroperator?: FilterOperator) {
        if (arg2 == undefined) {
            let filterItems = <Array<FilterItem>>arg1;
            this.filterHelper.add(filterItems);
        } else {
            let fieldnames: string[] = Array.isArray(arg1) ? arg1 : [arg1];
            let fieldvalues: string[] = Array.isArray(arg2) ? arg2 : [arg2];
            this.filterHelper.add(
                new FilterItem(fieldnames, fieldvalues, filteroperator)
            );
        }
        this.refresh();
    }

    clearFilter() {
        this.filterHelper.clear();
        this.refresh();
    }

    getFilterItems(): Array<FilterItem> {
        return this.filterHelper.filterItems;
    }
    //----------------

    get onGroupItems(): Subject<Array<GroupConfiguration>> {
        return this.groupHelper.onGroupConfigurations;
    }

    get isGrouped(): boolean {
        return this.groupHelper.groupConfigurations.length > 0;
    }

    setGroup(fieldnames: string[]);
    setGroup(fieldname: string);
    setGroup(arg1: any) {
        let fieldnames: string[] = Array.isArray(arg1) ? arg1 : [arg1];
        this.groupHelper.set(new GroupConfiguration(fieldnames));
        this.refresh();
    }

    addGroup(fieldnames: string[]);
    addGroup(fieldname: string);
    addGroup(arg1: any) {
        let fieldnames: string[] = Array.isArray(arg1) ? arg1 : [arg1];
        this.groupHelper.add(new GroupConfiguration(fieldnames));
        this.refresh();
    }

    clearGroup() {
        this.groupHelper.clear();
        this.refresh();
    }

    getGroupItems(): Array<GroupConfiguration> {
        return this.groupHelper.groupConfigurations;
    }

    //--- SelectionList

    public onSelectedIdsChanges = new Subject<Array<any>>();
    public onFocusedIdChanges = new Subject<any>();
    private initSelectionList() {
        this.selectionList.init(
            this.onSelectedIdsChanges,
            this.onFocusedIdChanges
        );
    }

    get selectedCount(): number {
        return this.selectedIds.length;
    }

    get selectedIds(): Array<any> {
        return this.selectionList.getSelectedIds();
    }

    isSelected(id: any): boolean {
        return this.selectionList.contains(id);
    }

	private focusAfterRefreshId: any;
    focusAfterRefresh(id: any) {
        this.focusAfterRefreshId = id;
    }

    focus(id: any, gotoPage: boolean = false) {
        if (gotoPage) {
            let pageIndex = this.getPageIndexById(id);
            if (pageIndex >= 0) {
                this.gotoPage(pageIndex);
            } else {
                this.loggerService.warn(
                    "cannot go to page of item  id=" +
                        id +
                        ". pageindex=" +
                        pageIndex
                );
            }
        }
        this.selectionList.set(id);
    }

    get focusedId(): any {
        return this.selectedCount > 0
            ? this.selectedIds[this.selectedCount - 1]
            : null;
    }

    get focusedItem(): any {
        let focusedItem = null;
        if (this.focusedId != null) {
            let focusedItems = this.dataBackup.filter(
                item => item[this.idfield] == this.focusedId
            );
            if (focusedItems.length > 0) focusedItem = focusedItems[0];
        }
        return focusedItem;
    }

    setSelection(ids: any[]);
    setSelection(id: any);
    setSelection(arg1: any) {
        this.selectionList.set(arg1);
    }

    addSelection(ids: any[]);
    addSelection(id: any);
    addSelection(arg1: any) {
        this.selectionList.add(arg1);
    }

    removeSelection(id: any) {
        this.selectionList.remove(id);
    }

    toggleSelection(id: any) {
        if (this.isSelected(id)) {
            this.selectionList.remove(id);
        } else {
            this.selectionList.add(id);
        }
    }

    clearSelection() {
        this.selectionList.clear();
    }

	selectAll() {
        this.setSelection(this.dataFiltered.map(d => d[this.idfield]));
    }

    //---------------

    public onPaginationChanged = new Subject<PaginationInfo>();
    private initPaginationHelper() {
        this.paginationHelper.init(this.onPaginationChanged);
    }

    setPageSize(pageSize: number) {
        this.paginationHelper.setPageSize(pageSize, this.data);
        this.refresh();
    }

    get paginationInfo(): PaginationInfo {
        return this.paginationHelper.paginationInfo;
    }

    gotoPage(pageIndex: number) {
        if (this.externalRefresh) {
            this.externalRefreshParams.paginationInfo.currentPageIndex = pageIndex;
        } else {
            this.paginationHelper.currentPageIndex = pageIndex;
        }
        this.refresh();
    }

    gotoPageOfFocusedItem() {
        let pageIndex = this.getPageIndexById(this.focusedId);
        if (pageIndex >= 0) this.gotoPage(pageIndex);
    }

    get currentPageIndex(): number {
        if (this.externalRefresh) {
            return this.externalRefreshParams.paginationInfo.currentPageIndex;
        } else {
            return this.paginationHelper.currentPageIndex;
        }
    }

    get maxPageIndex(): number {
        if (this.externalRefresh) {
            return this.externalRefreshParams.paginationInfo.maxPageIndex;
        } else {
            return this.paginationHelper.maxPageIndex;
        }
    }

    toggleAllFilteredSelected(selectAllFiltered: boolean) {
        if (selectAllFiltered) this.setSelection(this.dataFiltered.map(d => d[this.idfield]));
        else this.clearSelection();
    }

    //---RefreshParamStoreHelper
    private initRefreshParamsStoreHelper() {
        if (this.storeKey) {
            this.refreshParamsStoreHelper.init(
                this.storeKey,
                this.onAfterViewInit,
                this.onFilterItems,
                this.onSortItems,
                this.onPaginationChanged,
                this.onSelectedIdsChanges,
                (
                    filterItems: FilterItem[],
                    sortItems: SortItem[],
                    pageIndex?: number,
                    selectedIds?: any[]
                ) =>
                    this.refreshParamsStore(
                        filterItems,
                        sortItems,
                        pageIndex,
                        selectedIds
                    )
            );
        }
    }

    private refreshParamsStore(
        filterItems: FilterItem[],
        sortItems: SortItem[],
        pageIndex?: number,
        selectedIds?: any[]
    ) {
        this.refreshBlocked = true;
        this.setFilter(filterItems);
        let sortItem = sortItems && sortItems.length > 0 ? sortItems[0] : null;
        if (sortItem) this.sort(sortItem);
        if (pageIndex != undefined) this.gotoPage(pageIndex);
        if (selectedIds) this.setSelection(selectedIds);
        this.refreshBlocked = false;
    }
}
