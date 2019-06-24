import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Platform, ActionSheetController, AlertController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { LoggerService } from "../../shared/utilities/logger.service";

import { ImageTransformService } from "../utilities/image-transform.service";

import { ImageCreateDto } from "./image-gallery.dto";
import { ImageModel, ImageSettings } from "./image-gallery.model";

@Component({
    selector: 'image-gallery',
    templateUrl: 'image-gallery.component.html'
})
export class ImageGalleryComponent {

    public isMobile: boolean;
    @Input() images: Array<ImageModel>;
    @Input() settings: ImageSettings;
    @Output() onCreateImage = new EventEmitter<ImageCreateDto>();
    @Output() onDeleteImage = new EventEmitter<string>();

    constructor(
        private camera: Camera,
        private platform: Platform,
        public actionSheetCtrl: ActionSheetController,
        private alertCtrl: AlertController,
        private loggerService: LoggerService,
        private imageTransformService: ImageTransformService
    ) {
        this.images = [];

        platform.ready().then(() => {
            if (this.platform.is('cordova')) this.isMobile = true;
        });
    }

    //device camera
    public mobileGetPictureFromCamera() {
        this.loggerService.log("GalleryComponent.makePictureFromCamera");
        this.camera.getPicture({ sourceType: 1, correctOrientation: true, destinationType: 0, saveToPhotoAlbum: this.settings.saveOnDevice, targetWidth: this.settings.size, targetHeight: this.settings.size })
            .then((imageData) => {
                this.loggerService.info("GalleryComponent.makePictureFromCamera/success");
                this.createBase64Images(new Date().toString(), this.imageTransformService.getBase64FromImageSrcUrl(imageData));
            }, (err) => { this.loggerService.error("GalleryComponent.makePictureFromCamera/error" + JSON.stringify(err)); });
    }

    //device library
    public mobileGetPictureFromLibrary() {
        this.loggerService.log("GalleryComponent.makePictureFromLibrary");
        this.camera.getPicture({ sourceType: 0, correctOrientation: true, destinationType: 0, targetWidth: this.settings.size, targetHeight: this.settings.size })
            .then((imageData) => {
                this.loggerService.info("GalleryComponent.makePictureFromLibrary/success");
                this.createBase64Images(new Date().toString(), this.imageTransformService.getBase64FromImageSrcUrl(imageData));
            }, (err) => { this.loggerService.error("GalleryComponent.makePictureFromLibrary/error" + JSON.stringify(err)); });
    }

    //dekstopy only
    public async onDesktopOk(files: FileList) {
       this.loggerService.log("GalleryComponent.onDesktopOk");
       let file = files[0];
       let base64 = await this.getBase64FromFile(file);
       await this.createBase64Images(file.name, this.imageTransformService.getBase64FromImageSrcUrl(base64));
    }

    private async createBase64Images(name: string, base64: string) {
        this.loggerService.log("GalleryComponent.createImages");
        let resizedThumbImage = await this.resizeThumbImage(base64);
        this.onCreateImage.emit({ name: name, thumbBase64: resizedThumbImage, base64: base64 });
    }

    private resizeThumbImage(base64: string): Promise<string> {
        this.loggerService.log("GalleryComponent.resizeThumbImage");
        return this.imageTransformService.shrinkImage(base64, { height: this.settings.size, width: this.settings.size, quality: 0.7 });
    }

    private resizeOriginalImage(base64: string): Promise<string> {
        this.loggerService.log("GalleryComponent.resizeOriginalImage");
        return this.imageTransformService.shrinkImage(base64, { height: this.settings.size, width: this.settings.size, quality: 0.7 });
    }

    private getBase64FromFile(file: File): Promise<string> {
        this.loggerService.log("GalleryComponent.getBase64FromFile");
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (e: ProgressEvent) => resolve((<any>e.target).result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    public showImageActions(imageId: string) {
        this.actionSheetCtrl.create({
            title: 'Bild-Einstellungen',
            buttons: [
                { text: 'löschen', icon: 'trash', role: 'destructive', handler: () => { this.showImageDelete(imageId); } },
                { text: 'abbrechen', icon: 'close', role: 'cancel' }
            ]
        }).present();
    }

    private showImageDelete(imageId: string) {
        this.alertCtrl.create({
            title: 'Bild löschen?',
            buttons: [{ text: 'abbrechen' }, { text: 'löschen', handler: () => this.deleteImage(imageId) }]
        }).present();
    }

    private deleteImage(imageId: string) {
        this.onDeleteImage.emit(imageId);
    }
}