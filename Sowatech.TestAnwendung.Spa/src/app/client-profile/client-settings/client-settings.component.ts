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
import { ClientProfileWebApiService } from '../client-profile-web-api.service';
import { ClientSettingsDto, SmtpAccountDto, UpdateSmtpAccountParam } from './client-settings.dtos';
import { ClientSettingsModel } from './client-settings.model';

@Component({
    selector: 'client-settings',
    moduleId: module.id,
    templateUrl: './client-settings.component.html'
})

export class ClientSettingsComponent implements OnInit, OnDestroy {

    constructor(
        public translation: TranslationService,
        private webApiService: ClientProfileWebApiService,
        private logger: LoggerService,
        private messageBoxService: MessageBoxService,
        private genericEditDialogService: GenericEditDialogService
    ) {
    }

    @Language() lang: string;

    private subscriptions = new Array<Subscription>();
    ngOnInit() {
        this.refresh();
        //this.subscriptions.push();
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    model: ClientSettingsModel = new ClientSettingsModel();
    @ViewChild('loadingIndicator') loadingIndicator: LoadingIndicatorComponent;

    private async refresh() {
        this.loadingIndicator.show();
        try {
            let dto: ClientSettingsDto = await this.webApiService.getClientSettings();
            this.loadingIndicator.hide();
            this.model = new ClientSettingsModel(dto);
        }
        catch (error) {
            this.loadingIndicator.hide();
            this.logger.error(error);
        }
    }

    //---- Smtp

    public async editSmtp() {
        this.logger.log("ClientSettingsComponent.editSmtp");
        try {
            let dto: ClientSettingsDto = await this.webApiService.getClientSettings();
            this.logger.log("ClientSettingsComponent.editSmtp / sucess");
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

    async onSubmitSmtpEditDialog(editParam: UpdateSmtpAccountParam) {
        this.logger.log("ClientSettingsComponent.onSubmitEditDialog");
        try {
            await this.webApiService.updateSmtpAccount(editParam);
            this.logger.log("ClientSettingsComponent.onSubmitSmtpEditDialog / success");
            this.refresh();
        } catch (error) {
            this.logger.log("ClientSettingsComponent.onSubmitSmtpEditDialog / error");
            this.genericEditDialogService.showErrors(["Fehler beim Senden der Daten zum Server"]);
        }
    }

    async sendTestMail() {
        this.logger.log("ClientSettingsComponent.sendTestMail");
        try {
            let errorMessage: string = await this.webApiService.sendTestMail();
            if (!errorMessage) {
                this.logger.log("ClientSettingsComponent.sendTestMail/ success");
                this.messageBoxService.showDialog("Mail erfolgreich versendet", "Erfolgreich", MessageType.INFORMATION, MessageButtons.CLOSE);
            }
            else {
                this.logger.log("ClientSettingsComponent.sendTestMail/ errorMessage");
                this.messageBoxService.showDialog(errorMessage, "Fehler", MessageType.ERROR, MessageButtons.CLOSE);
            }
        }
        catch (error) {
            this.logger.error(error);
            this.messageBoxService.showDialog("Fehler beim Versenden der Mail", "Fehler", MessageType.ERROR, MessageButtons.CLOSE);
        }
    }
}
