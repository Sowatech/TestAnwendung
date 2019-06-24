import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';

import { LoggerService, MessageBoxService } from '../../shared';
import { LoadingIndicatorComponent } from '../../shared/swt-controls';
import { UserProfileWebApiService } from '../user-profile-web-api.service';
import { UserSettingsEditDialogComponent } from './user-settings-edit.component';
import { UserSettingsUpdateParam } from './user-settings.dtos';
import { UserSettingsModel } from './user-settings.model';

@Component({
    selector: 'user-settings',
    templateUrl: './user-settings.component.html'
})
export class UserSettingsComponent implements OnInit {
    model: UserSettingsModel = new UserSettingsModel();
    @Output() onSubmit = new EventEmitter();
    @ViewChild('editDialog') editDialog: UserSettingsEditDialogComponent;
    @ViewChild('loadingIndicator') loadingIndicator: LoadingIndicatorComponent;

    constructor(
        public translation: TranslationService,
        private webApiService: UserProfileWebApiService,
        private logger: LoggerService,
        private messageBoxService: MessageBoxService
    ) {
    }

    @Language() lang: string;
    ngOnInit() { this.refresh(); }

    private refresh() {
        this.loadingIndicator.show();

        // this.webApiService.getUserSettings()
        //     .subscribe(
        //     (dto: UserSettingsDto) => {
        //         this.loadingIndicator.hide();
        //         this.model.fromDto(dto);
        //     },
        //     (error) => {
        //         this.loadingIndicator.hide();
        //         this.logger.error(error);
        //     });
    }

    public edit() {
        this.logger.log("UserSettingsComponent.edit");
        // this.webApiService.getUserSettings()
        //     .subscribe(
        //     (dto: UserSettingsDto) => {
        //         this.editDialog.show(dto);
        //     },
        //     (error) => {
        //         this.logger.error(error);
        //         this.messageBoxService.showDialog("Fehler Laden der Daten vom Server", "Fehler", MessageType.WARNING, MessageButtons.CLOSE);
        //     }
        //     );
    }

    public async onSubmitEditDialog(editParam: UserSettingsUpdateParam) {
        this.logger.log("UserSettingsComponent.onSubmitEditDialog");
        try {
            let result = await this.webApiService.updateUserSettings(editParam);
            this.editDialog.hide();
            this.refresh();
        }
        catch (error) {
            this.logger.log("UserSettingsComponent.updateEdit / error");
            this.logger.error(error);
        };
    }
}