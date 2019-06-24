import { Component } from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';

import { HomeService } from './home.service';

@Component({
    selector: 'home',
    template: `
        <ibox heading="Willkommen bei TestAnwendung">
            {{'HOME.TITLE' | translate:lang}}
            <file-upload (onSubmitUpload)="test($event)"></file-upload>
        </ibox>
        `
})
export class HomeComponent {
    constructor(
        public translation: TranslationService,
        private homeService: HomeService
    ) {
    }

    @Language() lang: string;

    async test(files: FileList) {
        console.log("HomeComponent.test");
        try {
            await this.homeService.uploadDocuments({ file: files[0], id: 23 });
        }
        catch (err) { console.error(err); }
    }
}