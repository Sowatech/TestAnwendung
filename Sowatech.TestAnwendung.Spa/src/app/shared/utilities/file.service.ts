import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

@Injectable()
export class FileService {

    static ContentTypeDocX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    static ContentTypePDF = "application/pdf";

    public convertBase64ToBlob(base64: string, contentType: string) {
        let byteCharacters = atob(base64);
        let byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        let blob = new Blob([byteArray], { type: contentType });
        return blob;
    }

    public saveBase64ToFile(base64: string, contentType: string,filename?: string) {
        let blob = this.convertBase64ToBlob(base64, contentType);
        saveAs(blob, filename);
    }

    public save(data: Blob, filename?: string, disableAutoBOM?: boolean) {
        saveAs(data, filename, disableAutoBOM);
    }
}


