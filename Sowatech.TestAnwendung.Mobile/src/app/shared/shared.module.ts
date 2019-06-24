import { NgModule } from '@angular/core';

import { DialogsModule } from './dialogs/dialogs.module';
import { GalleryModule } from './image-gallery/image-gallery.module';
import { LightboxModule } from './lightbox/lightbox.module';

import { DebounceDirective } from './debounce/debounce.directive';

@NgModule({
    declarations: [DebounceDirective],
    imports: [
        DialogsModule, GalleryModule, LightboxModule
    ],
    exports: [
        DialogsModule, GalleryModule, LightboxModule, DebounceDirective
    ]
})
export class SharedModule { }