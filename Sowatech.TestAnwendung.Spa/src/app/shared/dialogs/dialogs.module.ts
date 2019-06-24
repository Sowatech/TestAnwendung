import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    L10nLoader,
    LocalizationModule,
    ProviderType,
    TRANSLATION_CONFIG,
    TranslationConfig,
    TranslationModule,
} from 'angular-l10n';
import { SelectModule } from 'ng-select';
import { ModalModule } from 'ngx-bootstrap';

import { SwtControlsModule } from '../swt-controls/swt-controls.module';
import { BackdropComponent } from './backdrop.component';
import { BackdropPrintComponent } from "./backdrop-print.component";
import { DialogInitDirective } from './dialog-init.directive';
import { FileDialogComponent } from './file-dialog.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { NoDblClickModule } from '../no-double-click/no-double-click.module';

export { MessageBoxComponent } from './message-box/message-box.component';
export { MessageBoxService, MessageButtons, MessageType, DialogResult } from './message-box/message-box.service';
export { FileDialogComponent } from './file-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        ModalModule,
        FormsModule,
        ReactiveFormsModule,
        SwtControlsModule,
        TranslationModule,
        LocalizationModule,
        SelectModule,
		NoDblClickModule
		],
    declarations: [
        FileDialogComponent,
        MessageBoxComponent,
        DialogInitDirective,
        BackdropComponent,
        BackdropPrintComponent,
    ],
    exports: [
        FileDialogComponent,
        MessageBoxComponent,
        DialogInitDirective,
        BackdropComponent,
        ModalModule,
        SelectModule,
        BackdropPrintComponent,
    ]
})
export class DialogsModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/shared/message-box-' },
        );
        this.l10nLoader.load();
    }
}
