import { Component } from '@angular/core';
import { Events, Platform, ModalController } from 'ionic-angular';

@Component({
    selector: 'home-page',
    templateUrl: 'home.page.html'
})
export class HomePage {

    constructor(
        private platform: Platform,
        private events: Events,
        private modalCtrl: ModalController
    ) {
        platform.ready().then(() => {
            //navCtrl.setRoot
        });
    }
}