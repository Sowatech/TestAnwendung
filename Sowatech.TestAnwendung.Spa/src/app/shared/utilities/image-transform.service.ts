import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import * as EXIF from 'exif-js';

@Injectable()
export class ImageTransformService {

    constructor(
        private logger: LoggerService) {
    }

    public getBase64FromFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (e: ProgressEvent) => resolve((<any>e.target).result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    public getBase64ImageSrcString(base64: string): string {
        return "data:image/jpeg;base64," + base64;
    }

    public getBase64FromImageSrcUrl(dataurlBase64: string): string {
        return dataurlBase64.replace(/data:image\/jpeg;base64,/g, '');
    }

    public async shrinkImage(base64: string, options: ImageTransformShrinkOptions): Promise<string> {
        this.logger.log("ImageTransformService.shrinkImage");

        try {
            let imageBase64 = base64.startsWith("data") ? base64 : this.getBase64ImageSrcString(base64);
            let img = await this.loadImage(imageBase64);

            if (img.width >= img.height) {
                options.width = Math.min(img.width, options.width);
                options.height = Math.min(img.width, options.width);
            }
            else {
                options.width = Math.min(img.height, options.height);
                options.height = Math.min(img.height, options.height);
            }

            let canvas = document.createElement('canvas');
            canvas.width = options.width;
            canvas.height = options.height;

            this.logger.log("ImageTransformService.shrinkImage/img.onload");
            let isLandscape = img.width >= img.height;
            let scaleFactor: number = 0;
            let width: number = 0;
            let height: number = 0;
            if (isLandscape) {
                scaleFactor = img.width > 0 ? canvas.width / img.width : 0;
                width = canvas.width;
                height = img.height * scaleFactor;
                canvas.height = height;
            }
            else {
                scaleFactor = img.height > 0 ? canvas.height / img.height : 0;
                width = img.width * scaleFactor;
                height = canvas.height;
                canvas.width = width;
            }
            let context = canvas.getContext('2d');
            context.drawImage(img, 0, 0, width, height);
            let dataurl = canvas.toDataURL("image/jpeg", options.quality);
            let resultBase64 = this.getBase64FromImageSrcUrl(dataurl);

            return Promise.resolve(resultBase64);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public loadImage(base64: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = (e) => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = base64;
        });
    }

    public async setMarkerOnImage(base64: string, options: ImageTransformMarkerOptions): Promise<string> {
        this.logger.log("ImageTransformService.setMarkerOnImage");

        try {
            let img = await this.loadImage(this.getBase64ImageSrcString(base64));

            this.logger.log("ImageTransformService.setMarkerOnImage/img.onload");
            let canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            let context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            context.translate(0.5, 0.5)

            let markercolor = options.markercolor ? options.markercolor : "red";
            context.strokeStyle = markercolor;

            let markertype = options.markertype ? options.markertype : "rect";
            if (markertype == "rect") {
                context.strokeRect(options.left, options.top, options.width, options.height);
            }
            else {
                context.beginPath();
                let half = options.width / 2;
                context.lineWidth = options.lineWidth;
                context.arc(options.left + half, options.top + half, half, 0, 2 * Math.PI);
                context.stroke();
            }
            let dataurl = canvas.toDataURL("image/jpeg");
            let resultBase64 = dataurl.replace(/data:image\/jpeg;base64,/g, '');

            return Promise.resolve(resultBase64);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public fixOrientation(base64: string): Promise<string> {
        this.logger.log("ImageTransformService.fixOrientation");
        let exifData = EXIF.readFromBinaryFile(this.base64ToArrayBuffer(base64));
        let orientation: number = parseInt((exifData.Orientation || 1).toString(), 10);
        return this.reOrient(base64, orientation);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        this.logger.log("ImageTransformService.base64ToArrayBuffer");
        let binaryString = window.atob(base64);
        let len = binaryString.length;
        let bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return <ArrayBuffer>bytes.buffer;
    }

    private reOrient(base64: string, orientation: number): Promise<string> {
        this.logger.log("ImageTransformService.reOrient");
        //http://jpegclub.org/exif_orientation.html
        switch (orientation) {
            case 1:
            case 2:
            case 4:
            case 5:
            case 7:
                if (orientation > 1) this.logger.warn("ImageTransformService/reOrient: Unhandled EXIF Orientation=" + orientation.toString());
                return Promise.resolve(base64);//unchanged
            case 3:
                return this.rotateImage(base64, 180);
            case 6:
                return this.rotateImage(base64, 90);
            case 8:
                return this.rotateImage(base64, 270);
        }
    }

    private async rotateImage(base64: string, angleInDegrees: number): Promise<string> {
        this.logger.log("ImageTransformService.rotateImage");


        try {
            let img = await this.loadImage(this.getBase64ImageSrcString(base64));

            this.logger.log("ImageTransformService.rotateImage/img.onload");
            var canvas = document.createElement('canvas');
            var maxsize = Math.max(img.width, img.height);
            canvas.width = maxsize;
            canvas.height = maxsize;

            var context = canvas.getContext('2d');
            context.save();
            context.translate(canvas.width / 2, canvas.height / 2);
            context.rotate(angleInDegrees * Math.PI / 180);
            context.drawImage(img, -img.width / 2, -img.height / 2);
            context.restore();

            var dataurl = canvas.toDataURL("image/jpeg");
            var resultBase64 = this.getBase64FromImageSrcUrl(dataurl);

            //bei drehung um vielfaches von 90 kann bild wieder sauber geschnitten werden
            if (angleInDegrees == 90 || angleInDegrees == 270 || angleInDegrees == -90 || angleInDegrees == 180) {
                var cropwidth = angleInDegrees == 180 ? img.width : img.height;
                var cropheight = angleInDegrees == 180 ? img.height : img.width;
                let croppedImage = await this.cropImage(resultBase64, { cropCoords: { width: cropwidth, height: cropheight } });
                return Promise.resolve(croppedImage);
            }
            else {
                return Promise.resolve(resultBase64);
            }
        }
        catch (err) {
            return Promise.reject(err);
        }

    }

    public setWatermark(base64: string, text: string, config?: { x: number, y: number }): Promise<string> {
        this.logger.log("ImageTransformService.setWatermark");

        return new Promise((resolve, reject) => {
            let img = new Image();
            img.src = this.getBase64ImageSrcString(base64);
            img.onload = () => {
                this.logger.log("ImageTransformService.setWatermark/img.onload");
                let canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                let context = canvas.getContext('2d');
                context.save();
                context.drawImage(img, 0, 0);
                context.font = '46pt Arial';
                context.fillStyle = 'white';
                context.shadowColor = "grey";
                context.shadowOffsetX = 1;
                context.shadowOffsetY = 1;
                context.shadowBlur = 10;
                context.textBaseline = 'alphabetic';
                context.scale(1, 1);
                context.fillText(text, 20, img.height - 20);
                context.restore();

                let dataurl = canvas.toDataURL("image/jpeg");
                return resolve(this.getBase64FromImageSrcUrl(dataurl));
            }
            img.onerror = (err) => { return reject(err); }
        });
    }

    public async cropImage(base64: string, options: CropOptions): Promise<string> {
        this.logger.log("ImageTransformService.cropImage");

        try {
            let img = await this.loadImage(this.getBase64ImageSrcString(base64));

            this.logger.log("ImageTransformService.cropImage/img.onload");
            var canvas = document.createElement('canvas');

            var left: number = 0;
            var top: number = 0;
            var width: number = 0;
            var height: number = 0;
            var validOptions: boolean = true;

            var cropType = options.cropType || "coords";
            if (cropType == "square") {
                var isLandscape = img.width > img.height;
                var minImageSize = Math.min(img.width, img.height);
                left = isLandscape ? img.width / 2 - minImageSize / 2 : 0;
                top = isLandscape ? 0 : img.height / 2 - minImageSize / 2;
                width = minImageSize;
                height = minImageSize;
            }
            if (cropType == "coords") {
                if (options.cropCoords) {
                    left = options.cropCoords.left || img.width / 2 - options.cropCoords.width / 2;
                    top = options.cropCoords.top || img.height / 2 - options.cropCoords.height / 2;
                    width = options.cropCoords.width;
                    height = options.cropCoords.height;
                }
                else {
                    validOptions = false;
                }
            }
            if (cropType != "square" && cropType != "coords") validOptions = false;

            canvas.width = width;
            canvas.height = height;

            var context = canvas.getContext('2d');
            context.drawImage(img, left, top, width, height, 0, 0, width, height);

            var dataurl = canvas.toDataURL("image/jpeg");
            var resultBase64 = this.getBase64FromImageSrcUrl(dataurl);
            return resultBase64;
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
}

export interface Coords {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
}

export interface CropOptions {
    cropType?: string;
    cropCoords?: Coords;
}

export interface ImageTransformShrinkOptions {
    width: number;
    height: number;
    quality: number;
}

export interface ImageTransformMarkerOptions extends Coords {
    markercolor: string;
    markertype: string;
    strokeStyle: string;
    lineWidth: number;
}
