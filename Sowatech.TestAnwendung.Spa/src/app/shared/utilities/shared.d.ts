declare interface SelectItem {
    value: any;
    text: string;
}

declare interface SubSelectItem {
    value: any;
    text: string;
    parentvalue: any;
}

declare type Dictionary<T> = { [key:string]:T}