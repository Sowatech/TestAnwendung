import { Injectable } from "@angular/core";
import { LoggerService } from "./logger.service";
import { ToastController } from "ionic-angular";

@Injectable()
export class ErrorHandlerService {
    constructor(
        private logger: LoggerService,
        private toastCtrl: ToastController,
    ) {

    }

    private isInHandleError = false;
    async handleError(error: Error, context: string, actionText?: string) {
        this.logger.error(context, error);
        if (this.isInHandleError) return;
        this.isInHandleError = true;
        let toast;
        if (error["message"]) {
            toast = this.toastCtrl.create({ message: error.message, duration: 5000 });
        }
        else {
            if (!actionText) actionText = "Behandeln";
            toast = this.toastCtrl.create({ message: `Fehler beim ${actionText} der Daten`, duration: 5000 });
        }
        toast.present();
        this.isInHandleError = false;
    }

    async serverLoadError(error, context: string) {
        return this.handleError(error, context, "Laden");
    }

    async serverSaveError(error, context: string) {
        return this.handleError(error, context, "Speichern");
    }

    async serverSyncError(error, context: string) {
        this.logger.warn(context + " Synchronisieren der Daten im Hintergrund schlug Fehl", error);
    }

}