import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarCodeComponent } from './bar-code.component';
import { ErrorHandlerService } from './error-handler.service';
import { TextareaAutosize } from './textarea-autosize.directive';

@NgModule({
    imports: [CommonModule],
    declarations: [BarCodeComponent,TextareaAutosize],
    exports: [BarCodeComponent,TextareaAutosize],
    providers: [
        ErrorHandlerService
    ]
})
export class UtilitiesModule { }