import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ["file-upload.component.scss"]
})
export class FileUploadComponent implements OnInit {
    public files: Array<File> = [];

    @Output() onFileSelected = new EventEmitter<Array<File>>();
    @Input() accept: string;//fileinput native accept
    @Input() multiple: boolean;
    @Input() height: string;
    @ViewChild('dialogForm') dialogForm;

    ngOnInit() {
        //if (!this.text) this.text = "Dateien hier ablegen oder auf die Fläche klicken.";
    }

    public fileUpload(e: Event) {
        this.files = Array.from((<HTMLInputElement>e.target).files);
        this.submitUpload();
    }

    public submitUpload() {
        this.onFileSelected.emit(this.files);
        this.dialogForm.nativeElement.reset();
    }
}
