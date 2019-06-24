export class DataSettingDto implements pouchDB.IBaseDoc {
    key: string;
    value?: any;

    _id: string;
    _rev?: string;
    _deleted?: boolean;
}

export class DataImageGalleryDto implements pouchDB.IBaseDoc {
    id: string;
    name: string;
    thumbBase64: string;
    base64: string;

    _id: string;
    _rev?: string;
    _deleted?: boolean;
}