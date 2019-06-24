import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

export class ZipService {

    private async saveAsZip(zipName: string, files: Array<Docs>) {
        console.warn(files);
        let zipFile = new JSZip();
        for (let document of files) {
            let docAsArrayBuffer = await this.readFile(document.file);
            zipFile.file(document.name, docAsArrayBuffer);
        }
        let blob = zipFile.generate({ type: "blob" });
        saveAs(blob, zipName + ".zip");
    }

    private readFile(file: Blob): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (e: ProgressEvent) => resolve((<any>e.target).result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(file);
        });
    }
}

export class Docs {
    name: string;
    file: Blob;
}