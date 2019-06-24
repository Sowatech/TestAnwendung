export class SettingsPageModel {
    constructor() {
        this.id = "settings"
        this.webApiServer = new WebApiServer();
        this.imageSettings = new ImageSettings();
    }
    id: string;
    webApiServer: WebApiServer;
    imageSettings: ImageSettings;
}

export class WebApiServer {
    apiurl: string;
}

export class ImageSettings {
    constructor() {
        this.size = 450;
        this.uploadDirectly = false;
        this.saveOnDevice = false;
    }

    size: number;
    uploadDirectly: boolean;
    saveOnDevice: boolean;
}