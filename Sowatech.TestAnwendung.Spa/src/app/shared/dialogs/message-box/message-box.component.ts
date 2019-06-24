import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';
import { ModalDirective } from 'ngx-bootstrap';

import { DialogResult, MessageBoxService, MessageButtons, MessageType } from './message-box.service';

@Component({
    selector: 'message-box',
    moduleId: module.id,
    templateUrl: './message-box.component.html',
	styles: ['.modal-footer button { margin-left:3px;}']
})
export class MessageBoxComponent implements OnInit, AfterViewInit {

    constructor(
        public translation: TranslationService,
        private messageBoxService: MessageBoxService) {
    }

    @Language() lang: string;
    ngOnInit() {
        //setTimeout(() => {
        //    this.messageBoxService.registerComponent(this);
        //}, 0);
    }

    ngAfterViewInit() {
        this.messageBoxService.registerComponent(this);
    }

    public text: string;
    public title: string;
    private messageButtons: MessageButtons = MessageButtons.OK_CANCEL;
    private messageType: MessageType = MessageType.PLAIN;

    @Output() cancel = new EventEmitter();
    @Output() submitWithOk = new EventEmitter();

    @ViewChild('dialog') dialog: ModalDirective;

    private dialogDeferred: Deferred<DialogResult>;

    public show(text: string, title?: string, messageType?: MessageType, messageButtons?: MessageButtons): Promise<DialogResult> {
        this.text = text;
        this.title = title;
        this.messageType = messageType || MessageType.PLAIN;
        this.messageButtons = messageButtons || MessageButtons.OK_CANCEL;

        if ((<any>this.dialog).backdrop) {
            //fixes call of show while backdrop of last sho still active
            setTimeout(() => { this.dialog.show(); }, 500);
        }
        else {
            this.dialog.show();
        }

        this.dialogDeferred = new Deferred<DialogResult>();
        return this.dialogDeferred.promise;
    }

    public showConfirm(text: string, title?: string): Promise<void> {
        let confirmDeferred = new Deferred<void>();
        this.show(text, title, MessageType.QUESTION, MessageButtons.OK_CANCEL)
            .then(
                (dialogResult) => {
                    if (dialogResult == DialogResult.OK) {
                        confirmDeferred.resolve();
                    }
                    //else {
                    //confirmDeferred.reject();
                    //}
                })
            .catch(() => {
                confirmDeferred.reject();
            });
        return confirmDeferred.promise;
    }

    public showClose(text: string, title?: string, messageType: MessageType = MessageType.INFORMATION): Promise<void> {
        let infoDeferred = new Deferred<void>();
        this.show(text, title, MessageType.INFORMATION, MessageButtons.CLOSE)
            .then(
                (dialogResult) => {
                    infoDeferred.resolve();
                })
            .catch(() => {
                infoDeferred.reject();
            });
        return infoDeferred.promise;
    }

    public closeDialog() {
        this.dialog.hide();
        this.dialogDeferred.resolve(DialogResult.CLOSE);
    }

    public btnClicked(btn: HTMLButtonElement) {
        this.dialog.hide();
        this.dialogDeferred.resolve(DialogResult[btn.value]);
    }

    btnVisible(btn: HTMLButtonElement): boolean {
        var result = false;
        var dialogResult: DialogResult = DialogResult[btn.value];
        switch (dialogResult) {
            case DialogResult.CANCEL:
                result = this.messageButtons == MessageButtons.OK_CANCEL || this.messageButtons == MessageButtons.YES_NO_CANCEL;
                break;
            case DialogResult.CLOSE:
                result = this.messageButtons == MessageButtons.CLOSE;
                break;
            case DialogResult.NO:
            case DialogResult.YES:
                result = this.messageButtons == MessageButtons.YES_NO || this.messageButtons == MessageButtons.YES_NO_CANCEL;
                break;
            case DialogResult.OK:
                result = this.messageButtons == MessageButtons.OK_CANCEL;
                break;
        }
        return result;
    }
}

class Deferred<T> {
    promise: Promise<T>;
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}