import { Component, Input } from '@angular/core';
import { Language, LocaleService, TranslationService } from 'angular-l10n';

import { LoggerService } from '../utilities/logger.service';


@Component({
    selector: 'swt-language-select',
    moduleId: module.id,
    template: `
    <select [ngClass]="customClass" class="dropdown-menu" style="display:inline-block;margin:14px;" (change)="changeLanguage($event)" [ngModel]="lang">
    <option value="de">Deutsch</option>
    <option value="en">English</option>
    <option value="fr">Français</option>
    </select>    
   `
})


export class SwtLanguageSelectComponent  {
    constructor(
        public locale: LocaleService,
        public translation: TranslationService,
        private logger: LoggerService
    ) {
    }
    @Language() lang: string;
    @Input('customClass') customClass: string;
    changeLanguage(ev) {
        this.locale.setCurrentLanguage(ev.currentTarget.value);
    }
} 