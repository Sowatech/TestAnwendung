import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';
import { Subscription } from 'rxjs/Subscription';

import {
    GenericEditDialogResult,
    GenericEditDialogService,
    LoggerService,
    MessageBoxService,
    MessageButtons,
    MessageType,
} from '../../shared';
import { LoadingIndicatorComponent } from '../../shared/swt-controls';
import { SystemAdministrationWebApiService } from '../system-administration-web-api.service';
import { SmtpAccountDto, SystemSettingsDto, UpdateSmtpAccountParam } from './system-settings.dtos';
import { SystemSettingsModel } from './system-settings.model';

@Component({
    selector: 'client-settings',
    templateUrl: './system-settings.component.html'
})

export class SystemSettingsComponent implements OnInit, OnDestroy {
    model: SystemSettingsModel = null;
    @ViewChild('loadingIndicator') loadingIndicator: LoadingIndicatorComponent;

    constructor(
        public translation: TranslationService,
        private webApiService: SystemAdministrationWebApiService,
        private logger: LoggerService,
        private messageBoxService: MessageBoxService,
        private genericEditDialogService: GenericEditDialogService
    ) {
        this.translation.init();
    }

    @Language() lang: string;
    private subscriptions = new Array<Subscription>();
    ngOnInit() {
        this.refresh();
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    private async refresh() {
        this.loadingIndicator.show();
        try {
            let dto: SystemSettingsDto = await this.webApiService.getSystemSettings();
            this.loadingIndicator.hide();
            this.model = new SystemSettingsModel(dto);
        }
        catch (error) {
            this.loadingIndicator.hide();
            this.logger.error(error);
        }
    }


    public async editSmtp() {
        this.logger.log("SystemSettingsComponent.editSmtp");
        try {
            let dto: SystemSettingsDto = await this.webApiService.getSystemSettings();
            this.logger.log("SystemSettingsComponent.editSmtp / sucess");
            this.genericEditDialogService.show<SmtpAccountDto>("SMTP_SETTINGS", dto.smtpAccount).subscribe(
                (dlgResult: GenericEditDialogResult<UpdateSmtpAccountParam, void>) => {
                    this.onSubmitSmtpEditDialog(dlgResult.dto);
                }
            );
        }
        catch (error) {
            this.logger.error(error);
            this.messageBoxService.showDialog("Fehler beim Laden der Daten vom Server", "Fehler", MessageType.ERROR, MessageButtons.CLOSE);

        }
    }

    private async onSubmitSmtpEditDialog(editParam: UpdateSmtpAccountParam) {
        this.logger.log("SystemSettingsComponent.onSubmitEditDialog");
        try {
            await this.webApiService.updateSmtpAccount(editParam);
            this.logger.log("SystemSettingsComponent.onSubmitSmtpEditDialog / success");
            this.refresh();
        }
        catch (error) {
            this.logger.log("SystemSettingsComponent.onSubmitSmtpEditDialog / error");
            this.genericEditDialogService.showErrors(["Fehler beim Senden der Daten zum Server"]);
        }
    }

    private async sendTestMail() {
        this.logger.log("SystemSettingsComponent.sendTestMail");
        try {
            let errorMessage: string = await this.webApiService.sendTestMail();
            if (!errorMessage) {
                this.logger.log("SystemSettingsComponent.sendTestMail/ success");
                this.messageBoxService.showDialog("Mail erfolgreich versendet", "Erfolgreich", MessageType.INFORMATION, MessageButtons.CLOSE);
            }
            else {
                this.logger.log("SystemSettingsComponent.sendTestMail/ errorMessage");
                this.messageBoxService.showDialog(errorMessage, "Fehler", MessageType.ERROR, MessageButtons.CLOSE);
            }
        }
        catch (error) {
            this.logger.error(error);
            this.messageBoxService.showDialog("Fehler beim Versenden der Mail", "Fehler", MessageType.ERROR, MessageButtons.CLOSE);
        }
    }
}
