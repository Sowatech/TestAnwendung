import { Injectable } from '@angular/core';

import { AuthGuard } from '../auth';
import { LoggerService, MessageBoxService } from '../shared';


@Injectable()
export class ErrorHandlerService {
    constructor(
        private messageBoxService: MessageBoxService,
        private logger: LoggerService,
        private authGuard: AuthGuard
    ) {
    }

    private isInHandleError = false;
    async handleError(error: Error, actionText?: string) {
        debugger
        this.logger.error(error);
        if (this.isInHandleError) return;
        this.isInHandleError = true;
        let resolvedByAuth = await this.authGuard.handleAuthError(error);
        if (!resolvedByAuth) {
            if (error["message"]) {
                this.messageBoxService.errorDialog(error.message, "Error " + (error["status"] ? error["status"] : ""));
            }
            else {
                if (!actionText) actionText = "Behandeln";
                this.messageBoxService.errorDialog(`Fehler beim ${actionText} der Daten`, "Fehler");
            }
        }
        this.isInHandleError = false;
    }

    async serverLoadError(error) {
        return this.handleError(error, "Laden");
    }

    async serverSaveError(error) {
        return this.handleError(error, "Speichern");
    }
}
