import { Component, Input, Output, ElementRef, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'lightbox',
    templateUrl: 'lightbox.component.html',
    styles: [`
.ng-gallery {
  width: 100%;
  display: inline-block;
}

div.ng-thumb{
    text-align:center;
    float:left;
    padding: 5px;
    margin: 5px;
    overflow:hidden;
}

div.ng-thumb img {
  cursor: pointer;
}

.ng-overlay { 
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  /*opacity: 0.85;*/
  z-index: 9999;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
}

.ng-gallery-content { 
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  text-align: center;
}

.ng-gallery-content > a.close-popup {
  font-size: 42px;
  float: right;
  color: #fff;
  text-decoration: none;
  margin: 0 30px 0 0;
  cursor: pointer;
  position: absolute;
  top: 20px;
  right: 0;
}

.ng-gallery-content > a.download-image {
  font-size: 42px;
  float: right;
  color: #fff;
  text-decoration: none;
  margin: 0 30px 0 0;
  cursor: pointer;
  position: absolute;
  top: 20px;
  right: 63px;
}

.ng-gallery-content > a.nav-left, .ng-gallery-content > a.nav-right {
  color: #fff;
  text-decoration: none;
  font-size: 60px;
  cursor: pointer;
  outline: none;
}

.ng-gallery-content > a.nav-left {
  position: fixed;
  left: 30px;
  top: 50%;
  transform: translateY(-50%);
}

.ng-gallery-content > a.nav-right {
  position: fixed;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
}

.ng-gallery-content > img {
  height: auto;
  max-height: calc(100% - 150px);
  max-width: calc(100% - 100px);
  position: relative;
  display: block;
  margin: 0 auto 0 auto;
  top: 50%;
  transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  cursor: pointer;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
}

.ng-gallery-content > img.effect {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
    from { opacity: 0.3; }
      to { opacity: 1; }
}

.ng-gallery-content > span.info-text {
  color: #fff;
  display: inline-block;
  width: 100%;
  height: 20px;
  font-weight: bold;
  text-align: center;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 100px;
}

.ng-gallery-content > .ng-thumbnails-wrapper {
  width: 400px;
  height: 70px;
  text-align: center;
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  overflow-x: hidden;
}

.ng-gallery-content > .ng-thumbnails-wrapper > .ng-thumbnails {
  width: 4000px;
  height: 70px;
}

.ng-gallery-content > .ng-thumbnails-wrapper > .ng-thumbnails > div > img {
  width: auto;
  height: 70px;
  float: left;
  margin-right: 10px;
  cursor: pointer;
  opacity: 0.6;
}

.ng-gallery-content > .ng-thumbnails-wrapper > .ng-thumbnails > div > img:hover, 
.ng-gallery-content > .ng-thumbnails-wrapper > .ng-thumbnails > div > img.active {
  transition: opacity 0.25s ease;
  opacity: 1;
}

/* Loading - from http://loading.io */
uiload {
  display: inline-block;
  position: relative; 
}

uiload > div {
    position: relative; 
}

@-webkit-keyframes uil-ring-anim {
  0% {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg); 
  }

  100% {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg); 
  } 
}

@-moz-keyframes uil-ring-anim {
  0% {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg); 
  }

  100% {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg); 
    } 
}

@-ms-keyframes uil-ring-anim {
  0% {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg); 
  }

  100% {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg); 
  } 
}

@keyframes uil-ring-anim {
  0% {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg); 
  }

  100% {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg); 
  } 
}

.uil-ring-css {
  background: none;
  position: relative;
  top: 0;
  margin: 180px auto 0 auto;
  width: 100px;
  height: 100px; 
}

.uil-ring-css > div {
    position: absolute;
    display: block;
    width: 80px;
    height: 80px;
    top: 20px;
    left: 20px;
    border-radius: 40px;
    box-shadow: 0 6px 0 0 #fff;
    -ms-animation: uil-ring-anim 1s linear infinite;
    -moz-animation: uil-ring-anim 1s linear infinite;
    -webkit-animation: uil-ring-anim 1s linear infinite;
    -o-animation: uil-ring-anim 1s linear infinite;
    animation: uil-ring-anim 1s linear infinite; 
}

.img-wrap {
        position: relative;
        display: inline-block;
        font-size: 0;
    }

        .img-wrap .lightboxBtn {
            position: absolute;
            top: 2px;
            right: 2px;
            z-index: 100;
            cursor: pointer;
            opacity: .0;
        }

        .img-wrap:hover .lightboxBtn {
            opacity: 1;
        }
`]
})
export class LightboxComponent implements OnInit {

    constructor(
    ) {
    }

    public currentImage: ILightBoxImage;

    private get currentImageIndex(): number {
        return this.currentImage ? this.images.indexOf(this.currentImage) : -1;
    }

    @Input('images') images: ILightBoxImage[];
    @Input('thumbSize') thumbSize: string = "50px";
    @Input('actions') actions: LightboxActions;
    @Output('imageClosed') imageClosed = new EventEmitter<void>();
    @Output('onButtonClicked') onButtonClicked = new EventEmitter<LightboxButtonEvent>();
    @Output('onImageClicked') onImageClicked = new EventEmitter<ILightBoxImage>();

    private opened: boolean = false;

    ngOnInit() {
    }

    closeImage() {
        this.opened = false;
        this.imageClosed.emit(null);
    }

    prevImage() {
        let imageIndex = this.images.indexOf(this.currentImage);
        imageIndex = imageIndex > 0 ? imageIndex - 1 : this.images.length - 1;
        this.currentImage = this.images[imageIndex];
        this.openImage();
    }

    nextImage() {
        let imageIndex = this.images.indexOf(this.currentImage);
        imageIndex = imageIndex == this.images.length - 1 ? 0 : imageIndex + 1;
        this.currentImage = this.images[imageIndex];
        this.openImage();
    }

    openImage(imageName?: string) {
        if (imageName) this.currentImage = this.images.find(img => img.imageName == imageName);
        this.opened = true;
        this.onImageClicked.emit(this.currentImage);
    }

    public buttonClicked(event: any, ident: string, image: ILightBoxImage) {
        let btnEvent: LightboxButtonEvent = <LightboxButtonEvent>{ ident: ident, imageName: image.imageName };
        this.onButtonClicked.emit(btnEvent);
    }
}

export interface ILightBoxImage {
    imageUrl: string;
    thumbUrl: string;
    imageName: string;
}

export class LightboxActions {
    public imageButtons: Array<LightboxImageButton>;
}

export class LightboxButtonEvent {
    public ident: string;
    public imageName: string;
}

export class LightboxImageButton {
    ident?: string;
    text?: string;
    tooltip?: string;
    buttonClass?: string;
    iconClass?: string;
}
