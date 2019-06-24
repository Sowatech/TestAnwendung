import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDialogComponent } from './file-dialog.component';
import { MessageBoxService } from './message-box.service';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        FileDialogComponent
    ],
    exports: [
        FileDialogComponent
    ],
    providers: [MessageBoxService]
})
export class DialogsModule {
}