
export class ImageModel {
    constructor() { }

    id: string;
    name: string;
    thumbBase64: string;
    base64: string;

    fromDto(dto: any) {
        this.id = dto.id;
        this.name = dto.name;
        this.thumbBase64 = dto.thumbBase64;
        this.base64 = dto.base64;
    }
}

export class ImageSettings {
    size: number;
    uploadDirectly: boolean;
    saveOnDevice: boolean;
}