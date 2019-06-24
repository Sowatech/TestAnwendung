import { Injectable, Component, Input, Output, EventEmitter } from '@angular/core';
import { Platform, ActionSheetController, AlertController } from 'ionic-angular';
import { LoggerService } from "../../shared/utilities/logger.service";
import { ImageTransformService } from "../utilities/image-transform.service";
import { Camera } from '@ionic-native/camera';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ImageService {

    public isMobile: boolean;
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

    }

    IMAGEWIDTH = 1800;
    IMAGEHEIGHT = 1200;

    THUMBIMAGEWIDTH = 180;
    THUMBIMAGEHEIGHT = 120;

    public mobileGetPictureFromCamera(): Observable<ImageCreateDto> {
        this.loggerService.info("ImageService.makePictureFromCamera");

        return Observable.fromPromise(this.camera.getPicture({ sourceType: 1, correctOrientation: true, destinationType: 0, saveToPhotoAlbum: true, targetWidth: this.IMAGEWIDTH, targetHeight: this.IMAGEHEIGHT }))
            .flatMap((imageData) => {
                this.loggerService.info("ImageService.makePictureFromCamera/success");
                return this.createBase64Images(new Date().toString(), this.imageTransformService.getBase64FromImageSrcUrl(imageData));
            })
            .flatMap((res) => {
                this.loggerService.info("ImageService.makePictureFromCamera/createBase64Images.success");
                return Observable.of(res)
            });
    }

    //device library
    public mobileGetPictureFromLibrary(): Observable<ImageCreateDto> {
        this.loggerService.info("ImageService.makePictureFromLibrary");

        return Observable.fromPromise(this.camera.getPicture({ sourceType: 0, correctOrientation: true, destinationType: 0, targetWidth: this.IMAGEWIDTH, targetHeight: this.IMAGEHEIGHT }))
            .flatMap((imageData) => {
                return this.createBase64Images(new Date().toString(), this.imageTransformService.getBase64FromImageSrcUrl(imageData));
            })
            .flatMap((res) => {
                this.loggerService.info("ImageService.mobileGetPictureFromLibrary/createBase64Images.success");
                return Observable.of(res)
            });
    }

    //dekstop only
    public async onDesktopOk(files: FileList): Promise<ImageCreateDto> {
        this.loggerService.info("ImageService.onDesktopOk");
        if (files.length > 0) {
            let file = files[0];
            let base64 = await this.getBase64FromFile(file);
            return this.createBase64Images(file.name, this.imageTransformService.getBase64FromImageSrcUrl(base64));
        }
        else return Promise.reject("empty files");
    }

    private async createBase64Images(name: string, base64: string): Promise<ImageCreateDto> {
        this.loggerService.info("ImageService.createImages");
        let resizedThumbImage = await this.resizeImage(base64, this.THUMBIMAGEWIDTH, this.THUMBIMAGEHEIGHT, 0.7);
        let resizedOriginalImage = await this.resizeImage(base64, this.IMAGEWIDTH, this.IMAGEHEIGHT);
        return Promise.resolve(<ImageCreateDto>{ name: name, thumbBase64: resizedThumbImage, base64: resizedOriginalImage });
    }

    private resizeImage(base64: string, width: number, height: number, quality: number = 1): Promise<string> {
        this.loggerService.info("ImageService.resizeImage");
        return this.imageTransformService.shrinkImage(base64, { height: height, width: width, quality: quality });
    }

    private resizeOriginalImage(base64: string, width: number, height: number): Promise<string> {
        this.loggerService.info("ImageService.resizeOriginalImage");
        return this.imageTransformService.shrinkImage(base64, { height: height, width: width, quality: 0.7 });
    }

    //filereader get base64
    private getBase64FromFile(file: File): Promise<string> {
        this.loggerService.info("ImageService.getBase64FromFile");
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (e: ProgressEvent) => resolve((<any>e.target).result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    public setWatermark(base64: string, text: string, config?: { x: number, y: number }): Promise<string> {
        this.loggerService.info("ImageService.setWatermark");
        return this.imageTransformService.setWatermark(base64, text);
    }
}

export class ImageCreateDto {
    name: string;
    thumbBase64: string;
    base64: string;
}