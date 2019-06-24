import { Injectable } from '@angular/core';

import { LoggerService } from '../../utilities';
import { MessageBoxComponent } from './message-box.component';

@Injectable()
export class MessageBoxService {

    //service zum globalen aufruf des confirmation dialogs. nur einmal zentral providen für zugriff auf gleiche membervariablen 
    constructor(private logger:LoggerService) {
    }

    private registeredComponent: MessageBoxComponent; 
    
    registerComponent(messageBoxComponent: MessageBoxComponent) {
        if (!messageBoxComponent) this.logger.error("MessageBoxService.registerDialog called with undefined dialog");
        this.registeredComponent = messageBoxComponent;
    }

    showDialog(text: string, title?: string, messageType?: MessageType, messageButtons?: MessageButtons): Promise<DialogResult> {
        return this.registeredComponent.show(text, title, messageType, messageButtons);
    }

    confirmDialog(text: string, title?: string): Promise<void> {
        return this.registeredComponent.showConfirm(text, title);
    }

    infoDialog(text: string, title?: string): Promise<void> {
        return this.registeredComponent.showClose(text, title);
    }

    errorDialog(text: string, title?: string): Promise<void> {
        return this.registeredComponent.showClose(text, title, MessageType.ERROR);
    }

    closeDialog() {
      this.registeredComponent.closeDialog();
    }
}

export enum MessageButtons { OK_CANCEL, YES_NO, YES_NO_CANCEL, CLOSE }
export enum MessageType { PLAIN, ERROR, INFORMATION, WARNING, QUESTION }
export enum DialogResult { OK, CANCEL, YES, NO, CLOSE }
