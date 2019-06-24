import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';
import { ModalDirective } from 'ngx-bootstrap';

import { LoggerService, MessageBoxService } from '../../shared';
import { UserSettingsDto, UserSettingsUpdateParam } from './user-settings.dtos';
import { UserSettingsEditModel } from './user-settings.model';

@Component({
    selector: 'user-settings-edit',
    moduleId: module.id,
    templateUrl: './user-settings-edit.component.html',
})
export class UserSettingsEditDialogComponent {

    constructor(
        public translation: TranslationService,
        private logger: LoggerService,
        private messageBoxService: MessageBoxService
    ) {
    }

    @Language() lang: string;
    model: UserSettingsEditModel = new UserSettingsEditModel(null);
    @Output() onCancel = new EventEmitter();
    @Output() onSubmit = new EventEmitter<UserSettingsUpdateParam>();
    @ViewChild('dialog') dialog: ModalDirective;

    show(dto: UserSettingsDto) {
        this.model.fromDto(dto);
        this.dialog.show();
    }

    hide() {
        this.dialog.hide();
    }

    submitDialog() {
        this.onSubmit.emit(this.model.toDto());
    }

    cancelDialog() {
        this.onCancel.emit(null);
        this.dialog.hide();
    }

}
