import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';
import { ImageGalleryComponent } from './image-gallery.component';
import { DialogsModule } from '../dialogs/dialogs.module';

import { ImageTransformService } from "../utilities/image-transform.service";

export { ImageGalleryComponent } from './image-gallery.component';

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        DialogsModule
    ],
    declarations: [
        ImageGalleryComponent
    ],
    exports: [
        ImageGalleryComponent
    ],
    providers: [ImageTransformService]
})
export class GalleryModule {
}