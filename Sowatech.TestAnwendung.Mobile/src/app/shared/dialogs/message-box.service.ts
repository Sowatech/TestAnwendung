import { Injectable } from '@angular/core';
import { AlertController, Alert } from 'ionic-angular';

@Injectable()
export class MessageBoxService {
    constructor(private alertCtrl: AlertController) { }

    alert: Alert;

    async showDialog(title: string, description?: string) {
        console.log("MessageBoxService.show");
        await this.alertCtrl.create({
            title: title,
            message: description
        }).present();
    }

    async showConfirmDialog(title: string, description?: string): Promise<DialogResult> {
        console.log("MessageBoxService.showConfirm");
        let confirmDeferred = new Deferred<DialogResult>();

        this.alert = await this.alertCtrl.create({
            title: title,
            message: description,
            buttons: [
                { text: 'abbrechen',cssClass:'alert-result-cancel', role: 'cancel', handler: () => confirmDeferred.resolve(DialogResult.CANCEL) },
                { text: 'ok',cssClass:'alert-result-ok', handler: () => confirmDeferred.resolve(DialogResult.OK) }
            ]
        }).present();

        return confirmDeferred.promise;
    }

    async showErrorDialog(title: string, description?: string): Promise<DialogResult> {
        console.log("MessageBoxService.showErrorDialog");
        let confirmDeferred = new Deferred<DialogResult>();

        this.alert = await this.alertCtrl.create({
            title: title,
            message: description,
            buttons: [
                { text: 'abbrechen', cssClass:'alert-result-cancel', role: 'cancel', handler: () => confirmDeferred.resolve(DialogResult.CANCEL) }
            ]
        }).present();

        return confirmDeferred.promise;
    }

    async hide() {
        console.log("MessageBoxService.hide");
        if (this.alert) {
            await this.alert.dismiss();
            this.alert = null;
        }
    }
}

export enum MessageType { PLAIN, ERROR, INFORMATION, WARNING, QUESTION }
export enum DialogResult { OK, CANCEL, YES, NO, CLOSE }

class Deferred<T> {
    promise: Promise<T>;
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}