import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalizationModule, TranslationModule } from 'angular-l10n';
import { TextMaskModule } from 'angular2-text-mask';
import { SelectModule } from 'ng-select';
import { BsDropdownModule, ModalModule, PopoverModule, TabsModule, TimepickerModule, TypeaheadModule } from 'ngx-bootstrap';

import { SharedCustomModule } from '../shared-custom/shared-custom.module';
import { ChartJsModule } from './chartjs/chartjs.module';
import { DialogsModule } from './dialogs/dialogs.module';
import { DatasourceModule } from './ds-datasource/ds-datasource.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { LightboxModule } from './lightbox/lightbox.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SwtControlsModule } from './swt-controls/swt-controls.module';
import { DragulaModule } from './swt-dragula/swt-dragula.module';
import { SwtGenericModule } from './swt-generic/swt-generic.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { NoDblClickModule } from './no-double-click/no-double-click.module';


@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        SharedCustomModule,
        DatasourceModule,
        ModalModule.forRoot(),
        BsDropdownModule.forRoot(),
        TabsModule.forRoot(),
        TimepickerModule.forRoot(),
        TypeaheadModule.forRoot(),
        PopoverModule.forRoot(),

        DragulaModule,
        SwtControlsModule,
        SchedulerModule,
        DialogsModule,
        ChartJsModule,
        SwtGenericModule,
        UtilitiesModule,
        TranslationModule,
        LocalizationModule,
        SelectModule,
        TextMaskModule,
        LightboxModule,
        FileUploadModule,
		NoDblClickModule
    ],
    exports: [
        FormsModule,
        CommonModule,
        SharedCustomModule,
        DatasourceModule,
        SwtGenericModule,
        DragulaModule,
        SwtControlsModule,
        SchedulerModule,
        DialogsModule,
        ChartJsModule,
        UtilitiesModule,
        TranslationModule, LocalizationModule,
        SelectModule,
        TextMaskModule,
        LightboxModule,
        FileUploadModule,
        BsDropdownModule,
        TabsModule,
        TimepickerModule,
		NoDblClickModule
    ],
    declarations: []
})
export class SharedModule { }
