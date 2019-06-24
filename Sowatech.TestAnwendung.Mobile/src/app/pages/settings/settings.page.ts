import { Component } from "@angular/core";
import { NavController, ToastController } from "ionic-angular";

import { LoggerService, LoaderService } from "../../shared";
import { SettingsApiService } from "./settings.service";
import { SettingsPageModel } from "./settings.model";

@Component({
    selector: 'settings-page',
    templateUrl: 'settings.page.html'
})
export class SettingsPage {

    constructor(
        public navCtrl: NavController,
        private settingsApiService: SettingsApiService,
        private loggerService: LoggerService,
        private loaderService: LoaderService,
        private toastCtrl: ToastController
    ) {
        this.loadSettings();
    }

    model = new Array<SettingsPageModel>();
    submitted: boolean;

    async loadSettings() {
        this.loggerService.info("SettingsPage.loadSettings");
        this.model = await this.settingsApiService.loadSettings();
    }

    async save(valid: boolean) {
        this.loggerService.info("SettingsPage.save");
        if (valid) {
            this.loaderService.show("Settings werden gespeichert");
            try {
                await this.settingsApiService.saveSettings(this.model);
                this.toastCtrl.create({ message: "Settings gespeichert", duration: 2000, position: "top" }).present();
            }
            catch (err) {
                this.loggerService.error("SettingsPage.save/error " + JSON.stringify(err));
                this.toastCtrl.create({ message: "Fehler beim Speichern", position: "top", showCloseButton: true, closeButtonText: "ok" }).present();
            }
            this.loaderService.hide();
        }
    }
}