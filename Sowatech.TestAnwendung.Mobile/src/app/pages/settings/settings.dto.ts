export class SettingsDto {
    constructor() {
        this.id = "settings"
        this.webApiServer = new WebApiServerDto();
        this.imageSettings = new ImageSettingDto();
    }

    id: string;
    webApiServer: WebApiServerDto;
    imageSettings: ImageSettingDto;
}

export class WebApiServerDto {
    apiurl: string;
}

export class ImageSettingDto {
    constructor() {
        this.size = 450;
        this.uploadDirectly = false;
        this.saveOnDevice = false;
    }

    size: number;
    uploadDirectly: boolean;
    saveOnDevice: boolean;
}