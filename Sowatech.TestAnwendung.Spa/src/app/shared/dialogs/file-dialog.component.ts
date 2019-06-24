import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'file-dialog',
    moduleId: module.id,
	template: '<form #dialogForm style="position:fixed;left:-9999px"><input type="file" #file (change)="ok(file.files)" style="display:none;" multiple="{{multiple}}" accept="{{extensions}}" /></form>'
})
export class FileDialogComponent {
    constructor() { }

    @Input() extensions: string;
    @Input() multiple: boolean;
    @Output() onOk = new EventEmitter();

    @ViewChild('file') file: ElementRef;
    @ViewChild('dialogForm') dialogForm;

    public show() {
        this.file.nativeElement.click();
    }

    public ok(fileList: FileList) {
        this.onOk.emit(fileList);
        this.dialogForm.nativeElement.reset();
    }
}