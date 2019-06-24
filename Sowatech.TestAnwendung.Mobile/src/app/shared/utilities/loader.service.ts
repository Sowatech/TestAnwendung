import { Injectable } from '@angular/core';
import { LoadingController, Loading } from 'ionic-angular';

@Injectable()
export class LoaderService {

    constructor(
        private loadingCtrl: LoadingController) {
    }

    loader: Loading;

    show(text: string, duration?: number) {
        console.log("LoaderService.show");
        this.loader = this.loadingCtrl.create({
            content: text, showBackdrop: false, duration: duration ? duration : 0
        });
        this.loader.present();
    }

    async hide(): Promise<void> {
        console.log("LoaderService.hide");
        if (this.loader) await this.loader.dismiss();
        return Promise.resolve();
    }
}