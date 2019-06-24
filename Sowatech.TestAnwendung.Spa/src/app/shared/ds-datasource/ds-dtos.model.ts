export class ISortItem {
    fieldname: string;
    reverse: boolean;
}

export class SortItem implements ISortItem {
    constructor(sortItemData: ISortItem);
    constructor(fieldname: string);
    constructor(fieldname: string, reverse: boolean);
    constructor(arg1: any, arg2?: boolean)
    {
        if (typeof (arg1) == 'string') {
            let fieldname = arg1;
            let reverse = arg2 != undefined ? arg2:false;
            this.fieldname = fieldname;
            this.reverse = reverse;
        }
        else {
            let sortItemData: ISortItem = arg1;
            this.fieldname = sortItemData.fieldname;
            this.reverse = sortItemData.reverse != undefined ? sortItemData.reverse : false;
        }        
    }
    fieldname: string;
    reverse: boolean = false;

    public static createSortItems(src: ISortItem[]): SortItem[] {
        let result = new Array<SortItem>();
        if (src) {
            for (var srcItem of src) {
                result.push(new SortItem(srcItem));
            }
        }
        return result;
    }
}

//reine daten (zb aus aus json)
export class IFilterItem {
    fieldnames: Array<string>;
    fieldvalues: Array<string>;
    filterOperator: FilterOperator;
}

export class FilterItem implements IFilterItem {
    constructor(filterItemData:IFilterItem);
    constructor(fieldnames: Array<string>, fieldvalue: string, filterOperator?: FilterOperator);
    constructor(fieldnames: Array<string>, fieldvalues: Array<string>, filterOperator?: FilterOperator);
    constructor(arg1: any, arg2?: any, filterOperator?: FilterOperator) {
        
        if (Array.isArray(arg1)) {
            this.fieldnames = <Array<string>>arg1;
            let fieldvalues = Array.isArray(arg2) ? arg2 : [arg2];
            this.fieldvalues = [];
            for (let f of fieldvalues) {
                if (typeof (f) != 'string') console.error("fieldvalue string expected");
                this.fieldvalues.push(f.toLocaleLowerCase());
            }
            this.filterOperator = filterOperator;
        }
        else {
            let filterItemData = <IFilterItem>arg1;
            this.fieldnames = filterItemData.fieldnames;
            this.fieldvalues = filterItemData.fieldvalues;
            this.filterOperator = filterItemData.filterOperator;
        }
        if (this.filterOperator==undefined) this.filterOperator = FilterOperator.Contains;
    }
    fieldnames: Array<string>;
    fieldvalues: Array<string>;
    filterOperator: FilterOperator;

    fieldnamesAreEqual(fieldnames: string[]): boolean;
    fieldnamesAreEqual(fieldname: string): boolean;
    fieldnamesAreEqual(arg1: any): boolean {
        let fieldnames = Array.isArray(arg1) ? <string[]>arg1 : [<string>arg1];
        return this.fieldnames.length == fieldnames.length &&
            fieldnames.every((f) => this.fieldnames.indexOf(f) >= 0);
    }

    get hasFieldValue(): boolean {
        return this.fieldvalues && this.fieldvalues.filter(item => item).length>0;
    }

    valueMatchesFilter(comparer: (filtervalue: string) => boolean): boolean {
        let result = false;
        if (!result) {
            for (var fieldvalue of this.fieldvalues) {
                result = comparer(fieldvalue);
                if (result) break;
            }
        }
        return result;
    }

    public static createFilterItems(src: IFilterItem[]): FilterItem[] {
        let result = new Array<FilterItem>();
        if (src) {
            for (var srcItem of src) {
                result.push(new FilterItem(srcItem));
            }
        }
        return result;
    }
}

export enum FilterOperator { StartsWith, IsEqual, Contains, IsGreaterOrEqual, IsLessOrEqual };

export class GroupConfiguration {
    constructor(fieldnames: Array<string>) {
        this.fieldnames = fieldnames;
    }

    fieldnames: Array<string> = [];
    get fieldnamesCommaString(): string { return this.fieldnames.join(",") }
}

export interface GroupDataItem {
    groupedItems: Array<any>;
}

export class PaginationInfo {
    constructor() {
        this.currentPageIndex = 0;
        this.currentPageNumOfItems = 0;
        this.maxPageIndex = 0;
        this.pageSize = 0;
        this.totalNumOfItems = 0;
    }
    currentPageIndex: number;
    currentPageNumOfItems: number;
    maxPageIndex: number;
    totalNumOfItems: number;
    pageSize: number;
}

export class RefreshParams {
    constructor() {
        this.paginationInfo = new PaginationInfo();
        this.sortItems = [];
        this.filterItems = [];
    }
    paginationInfo: PaginationInfo;
    sortItems: SortItem[];
    filterItems: FilterItem[];
}

export class RefreshResult<T> {
    constructor() {
        this.data = new Array<T>();
        this.refreshParams = new RefreshParams();
    }
    refreshParams: RefreshParams;
    data: Array<T>;
}

