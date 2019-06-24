import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    L10nLoader,
    LocalizationModule,
    ProviderType,
    TRANSLATION_CONFIG,
    TranslationConfig,
    TranslationModule,
} from 'angular-l10n';
import { BsDropdownModule, PopoverModule, TimepickerModule, TypeaheadModule } from 'ngx-bootstrap';

import { DialogsModule } from '../dialogs/dialogs.module';
import { DatasourceModule } from '../ds-datasource/ds-datasource.module';
import { SwtControlsModule } from '../swt-controls/swt-controls.module';
import { DragulaModule } from '../swt-dragula/swt-dragula.module';
import { ColHideDirective } from './col/col-hide.directive';
import { ColSelectDialogComponent } from './col/col-select-dialog.component';
import { ColVisibilityService } from './col/col-visibility.service';
import { GenericEditDialogFormComponent } from './swt-generic-edit-dialog/swt-generic-edit-dialog-form.component';
import { GenericEditDialogComponent } from './swt-generic-edit-dialog/swt-generic-edit-dialog.component';
import { GridCellSpanComponent, GridComponent } from './swt-grid/swt-grid.component';
import { ListEditorComponent } from './swt-list-editor/swt-list-editor.component';
import { TextMaskModule } from 'angular2-text-mask';
import { NoDblClickModule } from '../no-double-click/no-double-click.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DialogsModule,
        BsDropdownModule.forRoot(),
        TypeaheadModule.forRoot(),
        PopoverModule.forRoot(),
        TimepickerModule.forRoot(),
        SwtControlsModule,
        DatasourceModule,
        TranslationModule,
        DragulaModule,
        LocalizationModule,
        TextMaskModule,
		NoDblClickModule
    ],
    declarations: [
        GridComponent, GridCellSpanComponent,
        GenericEditDialogComponent, GenericEditDialogFormComponent, ListEditorComponent, ColHideDirective, ColSelectDialogComponent
    ],
    exports: [GridComponent, GenericEditDialogComponent, ListEditorComponent, ColHideDirective, ColSelectDialogComponent, TimepickerModule],
    providers: [ColVisibilityService]
})
export class SwtGenericModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/shared/swt-grid-' },
            { type: ProviderType.Static, prefix: './assets/resources/shared/swt-generic-edit-dialog-' },
            { type: ProviderType.Static, prefix: './assets/resources/shared/swt-list-editor-' },
            { type: ProviderType.Static, prefix: './assets/resources/shared/col-select-dialog-' },
        );
        this.l10nLoader.load();
    }
}
