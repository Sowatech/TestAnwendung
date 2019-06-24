import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CsvService } from './csv.service';
import { LoggerService } from './logger.service';
import { Session } from './session.service';
import { ImageTransformService, ImageTransformShrinkOptions } from './image-transform.service';

@NgModule({
    imports: [CommonModule],
    declarations: [],
    exports: [],
    providers: [ImageTransformService]
})
export class UtilitiesModule { }